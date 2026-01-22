import { Pane } from 'tweakpane'

import { distortA, distortB, fresnelPower, lineSeed } from '@/assets/materials/CylinderMaterial'

export const pane = new Pane({
  container: document.getElementById('tweakpane-container'),
})

pane.addBinding(distortA, 'value', { label: 'Mesh distort (A)', min: 0, max: 1, step: 0.01 })
pane.addBinding(distortB, 'value', { label: 'Mesh distort (B)', min: 0, max: 1, step: 0.01 })
pane.addBinding(fresnelPower, 'value', { label: 'Fresnel power', min: 0, max: 10, step: 0.1 })
pane.addBinding(lineSeed, 'value', { label: 'Line seed', min: 1, max: 1000, step: 1 })
