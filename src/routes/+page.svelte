<script>
	import Audio from '../lib/components/global/Audio.svelte';
	import Bubbles from '../lib/components/global/Bubbles.svelte';
	import gsap from 'gsap';
	import Input from '../lib/components/global/Input.svelte';

	let textAnswer = $state('');
	let textInput = $state('');
	let processedText = $state(''); // Pour suivre le texte déjà traité
	let isPlaying = $state(false); // Pour suivre l'état de lecture de l'audio
	let allSentences = $state([]); // Stocker toutes les phrases générées
	let sentenceIndex = $state(0); // Pour suivre l'index de la phrase courante
	let audioElements = $state([]); // Liste des éléments audio pour chaque phrase
	let raf = $state();

	$inspect(textInput);

	// Variables pour visualizer
	let audioContext;
	let analyser;
	let dataArray;
	let bufferLength;

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

		// Créer un AudioContext pour le visualizer si ce n'est pas déjà fait
		if (!audioContext) {
			raf = requestAnimationFrame(animateVisualizer);
			console.log('here');

			audioContext = new (window.AudioContext || window.webkitAudioContext)();
			analyser = audioContext.createAnalyser();
			analyser.fftSize = 256; // Taille du FFT pour l'analyse (256 bins)
			bufferLength = analyser.frequencyBinCount;
			dataArray = new Uint8Array(bufferLength);
		}

		// Pour chaque audio, créer une nouvelle source
		let source = audioContext.createMediaElementSource(audioElement);
		source.connect(analyser);
		analyser.connect(audioContext.destination);
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
			source.disconnect();
			playNextAudio(); // Jouer l'audio suivant quand le courant est terminé
		};
	}

	function animateVisualizer(e) {
		const elapsedTime = e / 1000;

		analyser.getByteFrequencyData(dataArray); // Obtenir les données de fréquence

		// console.log(dataArray);

		const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

		const silenceThreshold = 50;

		raf = requestAnimationFrame(animateVisualizer);

		gsap.to('#bubbles .circle', {
			height: (index) => {
				const randomFactor = (Math.sin(elapsedTime * 10 + index / 2) + 1) / 2;

				if (average < silenceThreshold) {
					return 168;
				} else {
					if (index === 0)
						return 168 + dataArray[index % dataArray.length] * 0.6 + randomFactor * 200;
					if (index === 1)
						return 168 + dataArray[index % dataArray.length] * 1.3 + randomFactor * 200;
					if (index === 2)
						return 168 + dataArray[index % dataArray.length] * 0.8 + randomFactor * 200;
					if (index === 3)
						return 168 + dataArray[index % dataArray.length] * 0.5 + randomFactor * 200;
				}
			},
			duration: 0.5
		});
	}
</script>

<div id="home">
	<div class="abs">
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
	</div>

	<Bubbles />

	<div class="bottom">
		<Input bind:textInput {submitOPENAI} />
	</div>
</div>

<style>
	#home {
		width: 680px;
		margin: auto;
		display: flex;
		flex-direction: column;
		height: 100svh;
	}

	.bottom {
		background-color: black;
	}

	.abs {
		position: absolute;
	}
</style>
