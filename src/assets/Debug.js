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

export const pane = new Pane({
  container: document.getElementById('tweakpane-container'),
})

pane.addBinding(distortA, 'value', { label: 'Mesh distort (A)', min: 0, max: 1, step: 0.01 })
pane.addBinding(distortB, 'value', { label: 'Mesh distort (B)', min: 0, max: 1, step: 0.01 })
pane.addBinding(fresnelPower, 'value', { label: 'Fresnel power', min: 0, max: 10, step: 0.1 })
pane.addBinding(matcapStrength, 'value', { label: 'Matcap strength', min: 0, max: 1, step: 0.01 })
pane.addBinding(colorA, 'value', { label: 'Color A', min: 0, max: 1, step: 0.01, color: { type: 'float' } })
pane.addBinding(colorB, 'value', { label: 'Color B', min: 0, max: 1, step: 0.01, color: { type: 'float' } })
pane.addBinding(colorC, 'value', { label: 'Color C', min: 0, max: 1, step: 0.01, color: { type: 'float' } })
pane.addBinding(colorD, 'value', { label: 'Color D', min: 0, max: 1, step: 0.01, color: { type: 'float' } })

