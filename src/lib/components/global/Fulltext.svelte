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

<div class="fulltext" bind:this={component}>
	<div class="container">
		{textAnswer}
	</div>
</div>

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

	.container {
		margin: auto;
		width: 680px;
		padding: 20px;

		color: #fff;

		font-family: Inter;
		font-size: 14px;
		font-style: normal;
		font-weight: 500;
		line-height: 22px; /* 157.143% */
		letter-spacing: -0.408px;
	}
</style>
