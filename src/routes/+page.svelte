<script>
	import gsap from 'gsap';
	import Input from '../lib/components/global/Input.svelte';
	import Fulltext from '../lib/components/global/Fulltext.svelte';
	import Experience from '../lib/components/webgl/assistant/Experience.svelte';
	import { onMount } from 'svelte';

	let textAnswer = $state('');
	let textInput = $state('');
	let processedText = $state(''); // Pour suivre le texte déjà traité
	let isPlaying = $state(false); // Pour suivre l'état de lecture de l'audio
	let allSentences = $state([]); // Stocker toutes les phrases générées
	let sentenceIndex = $state(0); // Pour suivre l'index de la phrase courante
	let audioElements = $state([]); // Liste des éléments audio pour chaque phrase
	let raf = $state();
	let fullText = $state('close');

	// Variables pour visualizer
	let audioContext;
	let analyser;
	let dataArray;
	let bufferLength;

	let ctx = $state();
	let component = $state();

	onMount(() => {
		ctx = gsap.context(() => {}, component);

		return () => ctx.revert();
	});

	const resetState = () => {
		// textInput = '';

		textAnswer = '';
		processedText = '';
		isPlaying = false;
		allSentences = [];
		sentenceIndex = 0;
		audioElements = [];
	};

	$effect(() => {
		if (textInput) {
			ctx.add(() => {
				gsap.fromTo(
					'.question',
					{
						webkitMaskPosition: '50% 0%',
						maskPosition: '50% 0%',
						webkitMaskSize: '400% 400%', // End with larger mask size
						maskSize: '400% 400%'
					},
					{
						maskPosition: '-20% 0%',
						delay: 0.1,
						duration: 2, // Adjust the duration as needed
						ease: 'power2.out'
					}
				);
			});
		}
	});

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

			// mask the question
			ctx.add(() => {
				gsap.to('.question', {
					maskPosition: '-80% 0%',
					duration: 2, // Adjust the duration as needed
					ease: 'power2.out',
					onComplete: () => {
						gsap.to('.question', { autoAlpha: 0 });
					}
				});
			});

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
	// Store the source outside the function so we can disconnect it later
	let currentSource = null;

	async function playNextAudio() {
		if (sentenceIndex >= audioElements.length) {
			console.log('here stop');
			return; // All sentences have been played
		}

		const { audioElement, sentence } = audioElements[sentenceIndex];
		allSentences[sentenceIndex] = sentence; // Update the current sentence

		// gsap part for visual effect
		gsap.fromTo(
			'.currentSentence',
			{
				webkitMaskPosition: '50% 0%',
				maskPosition: '50% 0%',
				webkitMaskSize: '400% 400%',
				maskSize: '400% 400%',
				opacity: 0
			},
			{
				maskPosition: '-20% 0%',
				delay: 0.1,
				duration: 2,
				ease: 'power2.out',
				opacity: 1,
				overwrite: true
			}
		);

		// Create AudioContext and visualizer if not already created
		if (!audioContext) {
			audioContext = new (window.AudioContext || window.webkitAudioContext)();
			analyser = audioContext.createAnalyser();
			analyser.fftSize = 256;
			bufferLength = analyser.frequencyBinCount;
			dataArray = new Uint8Array(bufferLength);
			raf = requestAnimationFrame(animateVisualizer);
		}

		// Disconnect the previous source if it exists
		if (currentSource) {
			currentSource.disconnect();
		}

		// Create a new source for the current audio element
		currentSource = audioContext.createMediaElementSource(audioElement);
		currentSource.connect(analyser);
		analyser.connect(audioContext.destination);

		audioElement.play();

		audioElement.onended = () => {
			sentenceIndex++;
			URL.revokeObjectURL(audioElement.src); // Free up the URL after use
			playNextAudio(); // Play the next audio when the current one finishes
		};
	}

	function animateVisualizer(e) {
		analyser.getByteFrequencyData(dataArray); // Obtenir les données de fréquence

		raf = requestAnimationFrame(animateVisualizer);

		window.dispatchEvent(new CustomEvent('audioVisualizer', { detail: dataArray }));
	}

	const stopAudio = () => {
		audioElements.forEach(({ audioElement }) => {
			if (!audioElement.paused) {
				audioElement.pause(); // Mettre en pause
				audioElement.currentTime = 0; // Remettre à zéro le temps de lecture
			}
		});

		// Réinitialiser l'état de la lecture audio
		isPlaying = false;
		sentenceIndex = 0;
	};
</script>

<div id="home" bind:this={component}>
	<!-- <Bubbles /> -->

	<div class="mid">
		<p class="currentSentence">{allSentences[sentenceIndex]}</p>
		<!-- <p>All Text: {textAnswer}</p> -->

		<div class="question">{question}</div>
	</div>

	<Fulltext {textAnswer} {fullText} />

	<div class="bottom">
		<button class="stop" onclick={stopAudio}>Stop</button>

		<Input bind:textInput bind:fullText {submitOPENAI} />
	</div>
</div>

<Experience />

<style>
	#home {
		width: 680px;
		margin: auto;
		display: flex;
		flex-direction: column;
		height: 100svh;
	}

	.bottom {
		/* background-color: black; */
		display: flex;
		align-items: center;
		flex-direction: column;
	}

	.abs {
		position: absolute;
	}

	.mid {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		height: calc(100svh - 200px);

		.question {
			position: absolute;
			display: flex;
			align-items: center;

			max-width: 500px;

			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);

			margin: 0;
			text-align: center;

			color: #fff;
			font-size: 24px;
			font-weight: 500;
			letter-spacing: -0.48px;

			white-space: nowrap;
			overflow: hidden;

			-webkit-mask-image: radial-gradient(circle, transparent 40%, black 60%);
			mask-image: radial-gradient(circle, transparent 40%, black 60%);
			-webkit-mask-size: 50% 50%;
			mask-size: 50% 50%;
			-webkit-mask-position: 50% 100%;
			mask-position: 50% 100%;
		}

		.currentSentence {
			position: absolute;
			display: flex;
			align-items: center;
			text-align: center;

			font-size: 24px;
			font-weight: 500;
			letter-spacing: -0.48px;

			width: fit-content;
			max-width: 680px;

			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);

			-webkit-mask-image: radial-gradient(circle, transparent 40%, black 60%);
			mask-image: radial-gradient(circle, transparent 40%, black 60%);
			-webkit-mask-size: 50% 50%;
			mask-size: 50% 50%;
			-webkit-mask-position: 50% 100%;
			mask-position: 50% 100%;
		}
	}

	.stop {
		display: block;
		padding: 13px 24px;
		flex-direction: column;
		align-items: flex-start;
		gap: 10px;
		border-radius: 999px;
		background: var(--red);
		font-weight: 500;
		cursor: pointer;
		margin-bottom: 24px;
	}

	.full-text {
	}
</style>
