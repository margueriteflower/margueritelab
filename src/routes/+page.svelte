<script>
	import Audio from '../lib/components/global/Audio.svelte';
	import Bubbles from '../lib/components/global/Bubbles.svelte';

	let textAnswer = $state('');
	let textInput = $state('');
	let processedText = $state(''); // Pour suivre le texte déjà traité
	let isPlaying = $state(false); // Pour suivre l'état de lecture de l'audio
	let allSentences = $state([]); // Stocker toutes les phrases générées
	let sentenceIndex = $state(0); // Pour suivre l'index de la phrase courante
	let audioElements = $state([]); // Liste des éléments audio pour chaque phrase

	const resetState = () => {
		textInput = '';

		textAnswer = '';
		processedText = '';
		isPlaying = false;
		allSentences = [];
		sentenceIndex = 0;
		audioElements = [];
	};

	// Fonction pour envoyer la requête à l'API OpenAI et obtenir des réponses
	const submitOPENAI = async (input) => {
		try {
			const response = await fetch('/api/assistant', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ input: input })
			});

			resetState();

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let done = false;

			while (!done) {
				const { value, done: readerDone } = await reader.read();
				done = readerDone;
				textAnswer += decoder.decode(value, { stream: true });

				// Découpe le texte en phrases et gère seulement les nouvelles
				const newText = textAnswer.substring(processedText.length);
				const sentences = newText.match(/[^.!?]+[.!?]+[\s]*/g);

				if (sentences) {
					for (const sentence of sentences) {
						await processSentence(sentence);
						allSentences.push(sentence);
					}
					processedText += newText; // Met à jour processedText après avoir traité
				}
			}
		} catch (error) {
			console.error('Error fetching stream:', error);
			textAnswer = 'Error fetching data';
		}
	};

	// Fonction pour traiter chaque phrase et la transformer en audio
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

		// Lire la réponse sous forme de Blob pour créer un élément audio
		const audioBlob = await ttsResponse.blob();
		const audioUrl = URL.createObjectURL(audioBlob);
		const audioElement = new window.Audio(audioUrl); // Créer un élément audio

		// Ajouter l'élément audio à la liste pour lecture
		audioElements.push({
			audioElement,
			sentence
		});

		// Si rien ne joue, commencer la lecture immédiatement
		if (!isPlaying) {
			playNextAudio();
		}
	}

	// Fonction pour jouer le prochain fichier audio
	async function playNextAudio() {
		if (sentenceIndex >= audioElements.length) {
			return; // Toutes les phrases ont été lues
		}

		const { audioElement, sentence } = audioElements[sentenceIndex];
		allSentences[sentenceIndex] = sentence; // Met à jour la phrase courante

		// // // S'assurer que l'élément audio est prêt à être joué
		// audioElement.addEventListener('canplaythrough', () => {
		// 	audioElement.play().catch((error) => {
		// 		console.error('Failed to play audio:', error);
		// 	});
		// });

		audioElement.play();
		// audioElement.addEventListener('error', (event) => {
		// 	console.error('Error with audio element:', event);
		// });

		audioElement.onended = () => {
			sentenceIndex++;
			URL.revokeObjectURL(audioElement.src); // Libérer l'URL après la lecture
			playNextAudio(); // Jouer l'audio suivant quand le courant est terminé
		};
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

<!-- Afficher la phrase courante -->
<p>Current Sentence: {allSentences[sentenceIndex]}</p>
<p>All Text: {textAnswer}</p>

<Audio {submitOPENAI} />

<Bubbles />
