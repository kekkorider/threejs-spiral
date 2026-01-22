import { Fn, positionLocal, positionWorld, uniform, uv, color, mix, smoothstep, instanceIndex, float, remap } from 'three/tsl'
import { MeshBasicNodeMaterial, DoubleSide } from 'three/webgpu'

export const CylinderMaterial = new MeshBasicNodeMaterial({
  side: DoubleSide,
  forceSinglePass: true
})

export const distortA = uniform(0)
export const distortB = uniform(0)

export const INSTANCE_COUNT = 16

CylinderMaterial.positionNode = Fn(() => {
  const pos = positionLocal

  const xA = uv().x
  const xB = uv().x.oneMinus()

  const i = instanceIndex.toFloat()
  const instanceT = i.div(float(INSTANCE_COUNT).sub(1).max(1))

  // per-instance delayed progress
  const localDistortA = distortA
    .sub(instanceT)
    .div(float(1).sub(instanceT))
    .clamp(0, 1)

  const localDistortB = distortB
    .sub(instanceT)
    .div(float(1).sub(instanceT))
    .clamp(0, 1)

  pos.y.subAssign(xA.mul(0.35)).subAssign(xA.mul(localDistortA).mul(1.4))
  pos.y.addAssign(xB.mul(0.35)).subAssign(xB.mul(localDistortB).mul(1.4))

  return pos
})()

CylinderMaterial.colorNode = Fn(() => {
  const colorA = color(0, 0, 0)
  const colorB = uv().toVec3()

  const colorFactor = smoothstep(3.5, 1.5, positionWorld.y.abs())

  return mix(colorA, colorB, colorFactor)
})()
