<script>
	import gsap from 'gsap';
	import { onMount } from 'svelte';
	let ctx = $state();
	let component = $state();

	onMount(() => {
		ctx = gsap.context(() => {
			gsap.fromTo(
				'.circle',
				{ scale: 0 },
				{
					scale: 1,
					delay: 0.5,
					stagger: { from: 'end', each: 0.05 },
					ease: 'power2.out',
					duration: 0.7
				}
			);
		}, component);

		return () => ctx.revert();
	});
</script>

<div id="bubbles" bind:this={component}>
	<div class="circle"></div>
	<div class="circle"></div>
	<div class="circle"></div>
	<div class="circle"></div>
</div>

<style>
	#bubbles {
		margin: auto;
		width: 680px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 70svh;
		flex-direction: row-reverse;
		/* filter: blur(20px); */
	}

	.circle {
		width: 168px;
		height: 168px;
		background-color: var(--blue);
		border-radius: 999px;
		will-change: height, transform;
	}
</style>
