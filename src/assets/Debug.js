import { Pane } from 'tweakpane'

import { distortA, distortB } from '@/assets/materials/CylinderMaterial'

const pane = new Pane({
  container: document.getElementById('tweakpane-container'),
})

pane.addBinding(distortA, 'value', { label: 'Mesh distort (A)', min: 0, max: 1, step: 0.01 })
pane.addBinding(distortB, 'value', { label: 'Mesh distort (B)', min: 0, max: 1, step: 0.01 })
