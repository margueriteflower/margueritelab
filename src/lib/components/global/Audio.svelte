<script>
	import gsap from 'gsap';

	let { submitOPENAI } = $props();

	let isRecording = $state(false);
	let mediaRecorder;
	let audioChunks = $state([]);
	let audioContext = $state();
	let analyser = $state();
	let dataArray = $state([]);

	async function startRecording() {
		try {
			audioChunks = [];
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

			// Créer le contexte audio et l'analyser
			audioContext = new (window.AudioContext || window.webkitAudioContext)();
			const source = audioContext.createMediaStreamSource(stream);
			analyser = audioContext.createAnalyser();
			analyser.fftSize = 32;
			dataArray = new Uint8Array(analyser.frequencyBinCount);
			source.connect(analyser);

			mediaRecorder = new MediaRecorder(stream);
			mediaRecorder.ondataavailable = (event) => {
				audioChunks.push(event.data);
			};
			mediaRecorder.start();
			isRecording = true;

			animateVisualizer();
		} catch (error) {
			console.error('Error accessing microphone:', error);
		}
	}

	function stopRecording() {
		return new Promise((resolve, reject) => {
			mediaRecorder.onstop = () => {
				const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
				resolve(audioBlob);
			};
			mediaRecorder.stop();
			isRecording = false;
			cancelAnimationFrame(animateVisualizer);
		});
	}

	async function handleRecording() {
		if (!isRecording) {
			startRecording();
		} else {
			const audioBlob = await stopRecording();
			sendToServer(audioBlob);
		}
	}

	async function sendToServer(audioBlob) {
		const formData = new FormData();
		formData.append('audio', audioBlob, 'recording.mp3');

		const response = await fetch('/api/stt', {
			method: 'POST',
			body: formData
		});

		const data = await response.json();

		console.log('Transcription:', data.transcription);

		submitOPENAI(data.transcription);
	}

	function animateVisualizer(e) {
		const elapsedTime = e / 1000;

		analyser.getByteFrequencyData(dataArray);

		const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

		const silenceThreshold = 50;

		requestAnimationFrame(animateVisualizer);

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

<button onclick={handleRecording}>
	{isRecording ? 'Stop Recording' : 'Start Recording'}
</button>
