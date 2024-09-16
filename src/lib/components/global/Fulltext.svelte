<script>
	import gsap from 'gsap';
	import { onMount } from 'svelte';

	const { textAnswer, fullText } = $props();

	let ctx = $state();
	let component = $state();

	onMount(() => {
		ctx = gsap.context(() => {}, component);

		return () => ctx.revert();
	});

	$effect(() => {
		ctx.add(() => {
			if (fullText === 'open') {
				gsap.to(component, { autoAlpha: 1 });
			} else {
				gsap.to(component, { autoAlpha: 0 });
			}
		});
	});
</script>

<div class="fulltext" bind:this={component}></div>

<style>
	.fulltext {
		background-color: black;
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100svh;
		opacity: 0;
		visibility: hidden;
	}
</style>
