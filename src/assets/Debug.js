import { Pane } from 'tweakpane'

import {
  distortA,
  distortB,
  fresnelPower,
  matcapStrength,
  colorA,
  colorB,
  colorC,
  colorD
} from '@/assets/materials/CylinderMaterial'

import { strength, threshold, radius } from '@/assets/bloom'

export const pane = new Pane({
  container: document.getElementById('tweakpane-container'),
  title: 'Debug'
})

const folderGlobal = pane.addFolder({ title: 'Global' })
folderGlobal.addBinding(distortA, 'value', { label: 'Mesh distort (A)', min: 0, max: 1, step: 0.01 })
folderGlobal.addBinding(distortB, 'value', { label: 'Mesh distort (B)', min: 0, max: 1, step: 0.01 })
folderGlobal.addBinding(fresnelPower, 'value', { label: 'Fresnel power', min: 0, max: 10, step: 0.1 })
folderGlobal.addBinding(matcapStrength, 'value', { label: 'Matcap strength', min: 0, max: 1, step: 0.01 })

const folderLine = pane.addFolder({ title: 'Line' })
folderLine.addBinding(colorA, 'value', { label: 'Color A', min: 0, max: 1, step: 0.01, color: { type: 'float' } })
folderLine.addBinding(colorB, 'value', { label: 'Color B', min: 0, max: 1, step: 0.01, color: { type: 'float' } })
folderLine.addBinding(colorC, 'value', { label: 'Color C', min: 0, max: 1, step: 0.01, color: { type: 'float' } })
folderLine.addBinding(colorD, 'value', { label: 'Color D', min: 0, max: 1, step: 0.01, color: { type: 'float' } })

const folderBloom = pane.addFolder({ title: 'Bloom' })
folderBloom.addBinding(strength, 'value', { label: 'Strength', min: 0, max: 2, step: 0.02 })
folderBloom.addBinding(threshold, 'value', { label: 'Threshold', min: 0, max: 2, step: 0.02 })
folderBloom.addBinding(radius, 'value', { label: 'Radius', min: 0, max: 2, step: 0.02 })

