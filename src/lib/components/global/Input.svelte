<script>
	import gsap from 'gsap';
	import { onMount } from 'svelte';
	let ctx = $state();
	let component = $state();

	onMount(() => {
		ctx = gsap.context(() => {}, component);

		return () => ctx.revert();
	});

	const click = () => {
		ctx.add(() => {
			const tl = gsap.timeline();
			const tl2 = gsap.timeline();
			const tl3 = gsap.timeline();

			tl.to('button', { left: 'initial', right: 6, ease: 'power2.in' });
			tl.to('.input', {
				width: 680,
				duration: 0.7,
				ease: 'back.out',
				transformOrigin: 'center center'
			});
			tl.set('input', { pointerEvents: 'all' });

			tl2.to('.arrow', { opacity: 0 });
			tl2.to('.microphone', { opacity: 1 });

			tl3.to('.skip-text', { autoAlpha: 0 });
			tl3.to('.placeholder', { opacity: 1, delay: 1.5 });
			tl3.to('.warning', { autoAlpha: 1 });
		});
	};
</script>

<div class="container" bind:this={component}>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="input" onclick={click}>
		<button>
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
					stroke="black"
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
					stroke="black"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M9.99999 12.5C9.58751 12.499 9.17942 12.4152 8.79996 12.2535C8.42049 12.0918 8.07739 11.8555 7.79101 11.5586C7.20478 10.9673 6.8756 10.1686 6.87499 9.33593V4.99999C6.87339 4.58916 6.95313 4.18208 7.10961 3.80222C7.26609 3.42235 7.49621 3.07722 7.78671 2.78671C8.07722 2.49621 8.42235 2.26609 8.80221 2.10961C9.18208 1.95313 9.58916 1.87339 9.99999 1.87499C11.7523 1.87499 13.125 3.24765 13.125 4.99999V9.33593C13.125 11.0805 11.723 12.5 9.99999 12.5Z"
					fill="black"
				/>
			</svg>
		</button>
		<div class="skip-text">click to skip</div>
		<input type="text" name="" id="" placeholder="Ask anything about our agency" />
		<div class="placeholder">Ask anything about our agency</div>
	</div>

	<div class="warning">Our AI can make mistakes. Verify it’s outputs.</div>
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
		will-change: width;
		flex-grow: 1;
	}

	input {
		all: unset;
		pointer-events: none;
		/* background-color: red; */
		width: 100%;
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
		min-width: 44px;
		height: 44px;
		padding: 12px;
		border-radius: 999px;
		background: #ffffff;
		position: absolute;
		left: 6px;
		will-change: right;

		svg {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);

			&.microphone {
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
		margin-bottom: 40px;
	}
</style>
