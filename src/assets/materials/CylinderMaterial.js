import { Fn, positionLocal, positionWorld, uniform, uv, color, mix, smoothstep } from 'three/tsl'
import { MeshBasicNodeMaterial, DoubleSide } from 'three/webgpu'

export const CylinderMaterial = new MeshBasicNodeMaterial({
  side: DoubleSide,
  forceSinglePass: true
})

export const distortA = uniform(0)
export const distortB = uniform(0)

CylinderMaterial.positionNode = Fn(() => {
  const pos = positionLocal

  const xA = uv().x.add(0.18)
  const xB = uv().x.oneMinus()

  pos.y.subAssign(xA.mul(0.35)).subAssign(xA.mul(distortA).mul(1.4))
  pos.y.addAssign(xB.mul(0.35)).subAssign(xB.mul(distortB).mul(1.4))

  return pos
})()

CylinderMaterial.colorNode = Fn(() => {
  const colorA = color(0, 0, 0)
  const colorB = uv().toVec3()

  const colorFactor = smoothstep(3.5, 1.5, positionWorld.y.abs())

  return mix(colorA, colorB, colorFactor)
})()
