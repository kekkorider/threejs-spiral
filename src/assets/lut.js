import { uniform, texture3D } from 'three/tsl'
import { lut3D } from 'three/addons/tsl/display/Lut3DNode'

export const intensity = uniform(0.4)

export const lutPass = (scenePassColor, lutTexture) => {
  const pass = lut3D(scenePassColor, texture3D(lutTexture.texture3D), lutTexture.texture3D.image.width)

  pass.intensityNode = intensity

  return pass
}
