import * as THREE from 'three';
import vertex from './shaders/vertex.glsl?raw';
import fragment from './shaders/fragment.glsl?raw';
// import GUI from 'lil-gui';
// import Stats from './Stats';
import gsap from 'gsap';

export default class Experience {
	constructor(canvas) {
		window.experience = this;

		this.canvas = canvas;

		this.scene = new THREE.Scene();

		this.ctx = gsap.context();

		this.setRenderer();
		this.setCamera();
		this.setMesh();
		// this.setLights();
		this.setEvents();
		// this.setDebug();
		this.setTick();
	}

	setMesh() {
		this.mesh = new THREE.Mesh(
			new THREE.PlaneGeometry(1, 1),
			new THREE.ShaderMaterial({
				vertexShader: vertex,
				fragmentShader: fragment,
				uniforms: {
					uResolution: {
						value: new THREE.Vector2(window.innerWidth, window.innerHeight)
					},
					uTime: { value: 0 },
					uFrequency: { value: 0 },
					uVisualizer: { value: 0 }
				}
			})
		);

		this.mesh.scale.set(this.viewportWidth, this.viewportHeight, 0);

		this.scene.add(this.mesh);
	}

	setCamera() {
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
		this.camera.position.set(0, 0, 2);

		// const controls = new OrbitControls(this.camera, this.canvas);
		// controls.enableDamping = true;

		// this.updateControls = function (deltaTime) {
		// 	controls.dampingFactor = deltaTime * 5;
		// 	controls.update();
		// };

		this.cameraUtils = () => {
			this.vFov = THREE.MathUtils.degToRad(this.camera.fov);
			this.viewportHeight = 2 * Math.tan(this.vFov / 2) * this.camera.position.z;
			this.viewportWidth = this.viewportHeight * this.camera.aspect;
		};
		this.cameraUtils();
	}

	setLights() {
		this.dir = new THREE.DirectionalLight();
		this.dir.position.set(1.76, 2.26, 2.38);
		this.dir.castShadow = true;
		this.dir.shadow.mapSize = new THREE.Vector2(1024 * 2, 1024 * 2);
		this.scene.add(this.dir);

		this.dirHelp = new THREE.CameraHelper(this.dir.shadow.camera, 1, 'red');
		// this.scene.add(this.dirHelp);

		this.ambient = new THREE.AmbientLight();
		this.scene.add(this.ambient);
	}

	setEvents() {
		this.resize = this.resize.bind(this);
		window.addEventListener('resize', this.resize);

		window.addEventListener('audioVisualizer', (e) => {
			const dataArray = e.detail;

			const silenceThreshold = 50;
			const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

			// const randomFactor = (Math.sin(this.elapsedTime * 10 + 0 / 2) + 1) / 2;

			gsap.to(this.mesh.material.uniforms.uVisualizer, {
				value: () => {
					if (average < silenceThreshold) return 0;
					return 4;
				},
				duration: 3
			});
		});
	}

	resize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(window.innerWidth, window.innerHeight);

		this.mesh.material.uniforms.uResolution.value = new THREE.Vector2(
			window.innerWidth,
			window.innerHeight
		);

		this.cameraUtils();
		this.mesh.scale.set(this.viewportWidth, this.viewportHeight, 0);
	}

	setRenderer() {
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: true
		});
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setClearColor('black');
		this.renderer.shadowMap.enabled = true;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1;
	}

	setTick() {
		/**
		 * Stats
		 */
		// this.stats = new Stats();
		// this.stats.showPanel(0);
		// document.body.appendChild(this.stats.dom);

		/**
		 * RAF
		 */
		this.previousTime = 0;

		this.tick = this.tick.bind(this);
		requestAnimationFrame(this.tick);
	}

	tick(t) {
		// this.stats.begin();

		this.elapsedTime = t / 1000;
		this.deltaTime = this.elapsedTime - this.previousTime;
		this.previousTime = this.elapsedTime;

		this.renderer.render(this.scene, this.camera);

		// this.mesh.rotation.y += this.deltaTime;

		this.mesh.material.uniforms.uTime.value = this.elapsedTime;

		// this.updateControls(this.deltaTime);

		// this.stats.end();
		requestAnimationFrame(this.tick);
	}

	setDebug() {
		const gui = new GUI();
	}

	destroy() {
		window.removeEventListener('resize', this.resize);
		cancelAnimationFrame(this.ticker); // not working

		this.ctx.revert();
	}
}
