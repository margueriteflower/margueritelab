<script>
	import { onMount } from 'svelte';
	import Experience from './main.js';

	let canvas = $state();

	onMount(() => {
		const experience = new Experience(canvas);
	});
</script>

<canvas bind:this={canvas}></canvas>

<style>
	canvas {
		position: fixed;
		top: 0;
		z-index: -10;
	}
</style>
