import { uniform } from 'three/tsl'
import { bloom } from 'three/addons/tsl/display/BloomNode'

export const strength = uniform(0.4)
export const threshold = uniform(0.24)
export const radius = uniform(0.26)

export const bloomPass = scenePassColor => {
  const pass = bloom(scenePassColor)

  pass.strength = strength
  pass.threshold = threshold
  pass.radius = radius

  return pass
}
