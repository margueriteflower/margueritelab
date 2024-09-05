<script>
	import Audio from '../lib/components/global/Audio.svelte';

	let textAnswer = $state('');
	let textInput = $state('');
	let processedText = $state(''); // Pour suivre le texte déjà traité
	let audioChunks = $state([]); // Pour stocker les morceaux d'audio générés
	let isPlaying = $state(false); // Pour suivre l'état de lecture de l'audio
	let allSentences = $state([]);
	let currentIndex = $state(0); // Pour suivre l'index de la phrase courante

	const submitOPENAI = async (input) => {
		try {
			const response = await fetch('/api/assistant', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ input: input })
			});

			textInput = '';

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let done = false;

			while (!done) {
				const { value, done: readerDone } = await reader.read();
				done = readerDone;
				textAnswer += decoder.decode(value, { stream: true });

				// Découpe le texte en phrases, mais seulement les nouvelles
				const newText = textAnswer.substring(processedText.length);
				const sentences = newText.match(/[^.!?]+[.!?]+[\s]*/g);

				if (sentences) {
					for (const sentence of sentences) {
						await processSentence(sentence);
						allSentences.push(sentence);
					}
					processedText += newText; // Mettre à jour processedText après avoir traité
				}
			}
		} catch (error) {
			console.error('Error fetching stream:', error);
			textAnswer = 'Error fetching data';
		}
	};

	async function processSentence(sentence) {
		if (!sentence) return;

		// Envoie la phrase au TTS pour synthèse
		const ttsResponse = await fetch('/api/tts', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ input: sentence })
		});

		const reader = ttsResponse.body.getReader();
		let done = false;

		while (!done) {
			const { value, done: readerDone } = await reader.read();
			done = readerDone;

			// Ajouter le morceau au tableau des morceaux audio
			audioChunks.push(value);

			// Si rien ne joue, commencer la lecture
			if (!isPlaying) {
				playAudioChunks();
			}
		}
	}

	async function playAudioChunks() {
		if (audioChunks.length === 0) {
			isPlaying = false;
			return;
		}

		isPlaying = true;

		const audioBuffer = new Blob(audioChunks, { type: 'audio/mpeg' });
		audioChunks = []; // Réinitialiser les morceaux après les avoir combinés

		const audioUrl = URL.createObjectURL(audioBuffer);
		const audioElement = new window.Audio(audioUrl);

		audioElement.onended = () => {
			if (currentIndex < allSentences.length) {
				currentIndex++; // Incrémente l'index seulement s'il y a une phrase suivante
			}
			playAudioChunks(); // Continue à jouer les morceaux suivants
		};
		audioElement.play();
	}
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		if (textInput !== '') submitOPENAI(textInput);
	}}
>
	<div>
		<input type="text" bind:value={textInput} placeholder="Ask something" />
		<button type="submit">Ask AI</button>
	</div>
</form>

<!-- <p>Current Index: {currentIndex}</p> -->
<p>Current Sentence: {allSentences[currentIndex - 1]}</p>
<!-- <p>All Sentences: {allSentences}</p> -->
<p>All Text: {textAnswer}</p>

<Audio {submitOPENAI} />
