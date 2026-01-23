<template>
	<canvas
		class="canvas"
		ref="canvas"
		:width="windowWidth"
		:height="windowHeight"
	/>
</template>

<script setup>
import { useTemplateRef, onMounted, nextTick, watch } from 'vue'
import {
	useWindowSize,
	useDevicePixelRatio,
	useUrlSearchParams,
	get,
} from '@vueuse/core'
import * as THREE from 'three/webgpu'
import { OrbitControls } from 'three/addons/controls/OrbitControls'

import { useGSAP } from '@/composables/useGSAP'
import { CylinderMaterial } from '@/assets/materials'
import { textureLoader } from '@/assets/loaders'

import {
	INSTANCE_COUNT,
	distortA,
	distortB,
	mapA as effectMapA,
	mapB as effectMapB,
} from '@/assets/materials/CylinderMaterial'

const canvasRef = useTemplateRef('canvas')
let perfPanel, debugPanel, scene, camera, renderer, mesh, controls

const { width: windowWidth, height: windowHeight } = useWindowSize()
const { pixelRatio: dpr } = useDevicePixelRatio()
const params = useUrlSearchParams('history')

const { gsap } = useGSAP()

const textures = new Map()

//
// Lifecycle
//
onMounted(async () => {
	await nextTick()

	createScene()
	createCamera()
	await createRenderer()
	await loadTextures()

	createMesh()

	createControls()

	createTimeline()

	gsap.ticker.fps(60)

	gsap.ticker.add(time => {
		perfPanel?.begin()

		updateScene(time)
		renderer.render(scene, camera)

		perfPanel?.end()

		debugPanel?.refresh()
	})

	if (Object.hasOwn(params, 'debug')) {
		const { pane } = await import('@/assets/Debug')
		debugPanel = pane

		if (!renderer.isWebGPURenderer) {
			const { ThreePerf } = await import('three-perf')

			perfPanel = new ThreePerf({
				anchorX: 'left',
				anchorY: 'top',
				domElement: document.body,
				renderer,
			})
		}
	}
})

//
// Watchers
//
watch(dpr, value => {
	renderer.setPixelRatio(value)
})

watch([windowWidth, windowHeight], value => {
	camera.aspect = value[0] / value[1]
	camera.updateProjectionMatrix()

	renderer.setSize(value[0], value[1])
})

//
// Methods
//
function updateScene(time = 0) {
	controls?.update()
}

function createScene() {
	scene = new THREE.Scene()
}

function createCamera() {
	camera = new THREE.PerspectiveCamera(
		40,
		get(windowWidth) / get(windowHeight),
		0.1,
		100,
	)

	camera.position.set(0.67, 2.16, 4.44)
}

async function createRenderer() {
	renderer = new THREE.WebGPURenderer({
		canvas: get(canvasRef),
		alpha: true,
		antialias: true,
		powerPreference: 'high-performance',
	})

	renderer.toneMapping = THREE.ACESFilmicToneMapping
	renderer.setClearColor(0x121212, 1)
	renderer.setSize(get(windowWidth), get(windowHeight))

	if (Object.hasOwn(params, 'debug')) {
		const { Inspector } = await import('three/addons/inspector/Inspector')

		renderer.inspector = new Inspector()
	}

	await renderer.init()
}

async function loadTextures() {
	const [mapA, mapB] = await textureLoader.load(['/map.png', '/map02.png'])

	mapA.wrapS = mapB.wrapS = THREE.RepeatWrapping
	mapA.colorSpace = mapB.colorSpace = THREE.SRGBColorSpace

	textures.set('mapA', mapA)
	textures.set('mapB', mapB)
}

function createControls() {
	controls = new OrbitControls(camera, renderer.domElement)
	controls.enableDamping = true
}

function createMesh() {
	effectMapA.value = textures.get('mapA')
	effectMapB.value = textures.get('mapB')

	const geometry = new THREE.CylinderGeometry(1, 1, 0.36, 64, 1, true)
	const material = CylinderMaterial

	mesh = new THREE.InstancedMesh(geometry, material, INSTANCE_COUNT)

	const dummyMatrix = new THREE.Matrix4()

	for (let i = 0; i < INSTANCE_COUNT; i++) {
		dummyMatrix.makeTranslation(0, (i - INSTANCE_COUNT / 2) * 0.7 + 0.36, 0)
		mesh.setMatrixAt(i, dummyMatrix)
	}

	scene.add(mesh)
}

function createTimeline() {
	const tl = gsap.timeline({
		repeat: -1,
		repeatDelay: 1,
	})
	tl.addLabel('start')

	tl.fromTo(
		distortB,
		{
			value: 0,
		},
		{
			value: 1,
			duration: 4,
			ease: 'power2.inOut',
		},
		'start',
	)

	tl.fromTo(
		distortA,
		{
			value: 0,
		},
		{
			value: 1,
			duration: 4,
			ease: 'power2.inOut',
		},
		'>1',
	)
}
</script>

<style scoped>
.canvas {
	height: 100dvh;
	width: 100dvw;
}
</style>
