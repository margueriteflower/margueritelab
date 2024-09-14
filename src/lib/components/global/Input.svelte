<script>
	import gsap from 'gsap';
	import { onMount } from 'svelte';
	import Audio from './Audio.svelte';
	import splt from 'spltjs';

	let { textInput = $bindable(), submitOPENAI } = $props();

	let ctx = $state();
	let component = $state();
	let open = $state(false);

	onMount(() => {
		ctx = gsap.context(() => {
			const tl = gsap.timeline();
			tl.fromTo(
				'.input',
				{ width: 54, scale: 0 },
				{ scale: 1, delay: 0.2, duration: 0.5, ease: 'back.out' }
			);
			tl.to('.input', { width: 240, delay: 0.2, duration: 0.8 }, '-=0.2');
			tl.fromTo('.skip-text', { opacity: 0 }, { opacity: 1, duration: 1 });

			// split text
			splt({ target: '.skip-text' });
		}, component);

		return () => ctx.revert();
	});

	$effect(() => {
		// if (textInput !== '') {
		// 	ctx.add(() => {
		// 		gsap.to('svg:not(.send)', { opacity: 0 });
		// 		gsap.to('svg.send', { opacity: 1 });
		// 	});
		// } else {
		// 	ctx.add(() => {
		// 		gsap.to('svg.microphone', { opacity: 1 });
		// 		gsap.to('svg.send', { opacity: 0 });
		// 	});
		// }
	});

	const click = () => {
		if (open) return;
		open = true;

		ctx.add(() => {
			const tl = gsap.timeline();
			const tl2 = gsap.timeline();
			const tl3 = gsap.timeline();

			const microShake = () => {
				const tl = gsap.timeline();

				tl.to('.microphone', { rotate: 10, duration: 0.2, ease: 'none' });
				tl.to('.microphone', { rotate: -10, duration: 0.2, ease: 'none' });
				tl.to('.microphone', { rotate: 0, duration: 0.2, ease: 'none' });
			};

			gsap.to('button', { x: 0 });

			tl.to('button', {
				left: 'initial',
				right: 6,
				ease: 'power2.inOut',
				duration: 0.7,
				pointerEvents: 'all',
				onStart: () => {
					gsap.to('.input', {
						width: 54,
						duration: 1,
						ease: 'power2.inOut',
						delay: 0.3
					});
				}
			});
			// tl.to(
			// 	'.input',
			// 	{
			// 		width: 54,
			// 		duration: 1,
			// 		ease: 'power2.inOut'
			// 	},
			// 	'-=0.5'
			// );
			tl.to('.microphone', { opacity: 1 }, '-=0.2');
			tl.to('.input', { scale: 1.5, ease: 'back.out', duration: 1, onStart: microShake });

			tl.to('.input', { scale: 1, ease: 'back.out' });
			tl.to(
				'.input',
				{
					width: 680,
					duration: 1.3,
					ease: 'power2.inOut',
					onStart: () => {
						gsap.to('.microphone', { rotate: -20 });
						gsap.to('.microphone', { rotate: 0, delay: 1 });
					}
				},
				'-=0.2'
			);

			tl.set('input', { pointerEvents: 'all' });

			tl2.to('.arrow', { opacity: 0 });

			tl3.to('.skip-text', { autoAlpha: 0 });
			// tl3.to('.placeholder', { opacity: 1, delay: 0.6 });
			// tl3.to('.warning', { autoAlpha: 1 });
		});

		const tl = gsap.timeline();

		// tl.to('#bubbles .circle', { scale: 0, stagger: { from: 'end', each: 0.1 } });
		// tl.to('#bubbles .circle', { scale: 1, stagger: { from: 'end', each: 0.1 } });
		// tl.to('#bubbles .circle', { scale: 0, stagger: { from: 'end', each: 0.1 } });
	};

	const mouseenter = () => {
		ctx.add(() => {
			gsap.to('.skip-text span.char', { color: '#007aff', stagger: 0.05 });
			gsap.to('.skip-text span.char', {
				color: 'rgba(255, 255, 255, 0.75)',
				stagger: 0.05,
				delay: 0.2
			});

			if (!open) gsap.to('button', { x: 5 });
		});
	};

	const mouseleave = () => {
		ctx.add(() => {
			if (!open) gsap.to('button', { x: 0 });
		});
	};
</script>

<div class="container" bind:this={component}>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<form
		onsubmit={(e) => {
			e.preventDefault();
			if (textInput !== '') submitOPENAI(textInput);
		}}
	>
		<div class="input" onclick={click} onmouseenter={mouseenter} onmouseleave={mouseleave}>
			<button>
				<Audio {submitOPENAI} bind:textInput>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 20 20"
						fill="none"
						class="arrow"
					>
						<path
							d="M7.1875 4.375L12.8125 10L7.1875 15.625"
							stroke="white"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>

					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 20 20"
						fill="none"
						class="microphone"
					>
						<path
							d="M7.5 17.5H12.5M15 8.125V9.375C15 12.125 12.75 14.375 10 14.375M10 14.375C7.25 14.375 5 12.125 5 9.375V8.125M10 14.375V17.5"
							stroke="white"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							d="M9.99999 12.5C9.58751 12.499 9.17942 12.4152 8.79996 12.2535C8.42049 12.0918 8.07739 11.8555 7.79101 11.5586C7.20478 10.9673 6.8756 10.1686 6.87499 9.33593V4.99999C6.87339 4.58916 6.95313 4.18208 7.10961 3.80222C7.26609 3.42235 7.49621 3.07722 7.78671 2.78671C8.07722 2.49621 8.42235 2.26609 8.80221 2.10961C9.18208 1.95313 9.58916 1.87339 9.99999 1.87499C11.7523 1.87499 13.125 3.24765 13.125 4.99999V9.33593C13.125 11.0805 11.723 12.5 9.99999 12.5Z"
							fill="white"
						/>
					</svg>

					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						class="send"
					>
						<path
							d="M20.2737 10.7145L20.2677 10.7119L4.25074 4.06851C4.11602 4.01213 3.96943 3.99001 3.82407 4.00415C3.67871 4.01829 3.53912 4.06823 3.41779 4.14952C3.2896 4.23352 3.1843 4.34807 3.11138 4.48286C3.03845 4.61765 3.00017 4.76846 3 4.92172V9.17049C3.00007 9.38 3.07323 9.58293 3.20686 9.74429C3.3405 9.90565 3.52624 10.0153 3.73207 10.0544L12.4678 11.6697C12.5021 11.6762 12.5331 11.6945 12.5554 11.7214C12.5776 11.7483 12.5898 11.7822 12.5898 11.8171C12.5898 11.8521 12.5776 11.8859 12.5554 11.9128C12.5331 11.9397 12.5021 11.958 12.4678 11.9645L3.73244 13.5798C3.52667 13.6188 3.34094 13.7283 3.20725 13.8895C3.07355 14.0508 3.00026 14.2535 3 14.463V18.7125C2.9999 18.8589 3.03614 19.0029 3.10546 19.1318C3.17477 19.2607 3.27501 19.3704 3.39716 19.451C3.5441 19.5486 3.71654 19.6008 3.89296 19.601C4.0156 19.6009 4.13699 19.5763 4.24999 19.5286L20.2666 12.9231L20.2737 12.9197C20.4893 12.8271 20.673 12.6732 20.8021 12.4773C20.9312 12.2813 21 12.0518 21 11.8171C21 11.5825 20.9312 11.3529 20.8021 11.157C20.673 10.961 20.4893 10.8072 20.2737 10.7145Z"
							fill="white"
						/>
					</svg>
				</Audio>
			</button>

			<div class="skip-text">click to skip</div>
			<input
				type="text"
				name=""
				id=""
				placeholder="Ask anything about our agency"
				bind:value={textInput}
			/>
			<div class="placeholder">Ask anything about our agency</div>
		</div>

		<div class="warning">Our AI can make mistakes. Verify it’s outputs.</div>
	</form>
</div>

<style>
	.input {
		display: flex;
		width: 240px;
		height: 54px;
		padding: 0px 20px;
		justify-content: flex-start;
		align-items: center;
		gap: 10px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		position: relative;
		cursor: pointer;
		margin: auto;
		will-change: width, transform;
		flex-grow: 1;
	}

	input {
		all: unset;
		pointer-events: none;
		/* background-color: red; */
		width: calc(100% - 50px);
		height: 100%;
		color: rgba(255, 255, 255, 1);
		font-family: 'Inter';

		font-family: 'Inter', sans-serif;
		font-size: 14px;
		font-style: normal;
		font-weight: 500;
		line-height: normal;
		letter-spacing: -0.28px;

		&::placeholder {
			color: rgba(255, 255, 255, 0.75);
			font-family: 'Inter', sans-serif;
			font-size: 14px;
			font-style: normal;
			font-weight: 500;
			line-height: normal;
			letter-spacing: -0.28px;
			opacity: 0;
		}

		&:focus + .placeholder {
			visibility: hidden;
		}
	}

	.skip-text {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		color: rgba(255, 255, 255, 0.75);
		font-family: Inter;
		font-size: 14px;
		font-weight: 500;
		letter-spacing: -0.28px;
	}

	button {
		width: 44px;
		height: 44px;
		padding: 12px;
		border-radius: 999px;
		background: var(--blue);
		position: absolute;
		left: 6px;
		will-change: right;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		pointer-events: none;

		svg {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);

			&.microphone {
				opacity: 0;
			}

			&.send {
				opacity: 0;
			}
		}
	}

	.placeholder {
		position: absolute;
		left: 20px;
		opacity: 0;

		color: rgba(255, 255, 255, 0.75);
		font-family: 'Inter', sans-serif;
		font-size: 14px;
		font-style: normal;
		font-weight: 500;
		line-height: normal;
		letter-spacing: -0.28px;
		pointer-events: none;
	}

	.warning {
		color: rgba(255, 255, 255, 0.5);
		font-family: Inter;
		font-size: 14px;
		font-style: normal;
		font-weight: 400;
		line-height: normal;
		opacity: 0;
		visibility: hidden;
		text-align: center;
		margin-top: 12px;
	}
</style>
