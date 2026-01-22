import { Fn, positionLocal, positionWorld, uniform, uv, vec3, hash, sin, color, mix, smoothstep, instanceIndex, step, float, normalWorld, cameraPosition, dot, time, texture } from 'three/tsl'
import { MeshBasicNodeMaterial, DoubleSide, DataTexture, RedFormat, FloatType } from 'three/webgpu'

export const CylinderMaterial = new MeshBasicNodeMaterial({
  side: DoubleSide,
  forceSinglePass: true
})

const dummyTexture = new DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1)
dummyTexture.format = RedFormat
dummyTexture.type = FloatType
dummyTexture.needsUpdate = true

export const map = uniform(dummyTexture)
export const distortA = uniform(0)
export const distortB = uniform(0)
export const fresnelPower = uniform(1.15)
export const lineSeed = uniform(1)

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
  const black = color(0)

  const cameradir = cameraPosition.normalize()

  // Dot product
  const d = dot(cameradir, normalWorld)
  d.assign(d.pow(fresnelPower))

  // Y in world space
  const colorFactor = smoothstep(3.5, 1.5, positionWorld.y.abs())
  colorFactor.mulAssign(d)

  // Line
  // const lineUV = uv().toVar()
  // const lineFreq = Math.PI * 46
  // const lineAmplitude = float(0.1).add(uv().x.mul(2).sub(1).abs().mul(0.3))
  // const lineSpeed = float(time).mul(2.3)
  // const lineOpacity = smoothstep(0.95, 0.6, lineAmplitude)
  // lineUV.y = lineUV.y.add(lineUV.x.mul(lineFreq).add(lineSpeed).sin().mul(lineAmplitude))
  // const line = lineUV.y.sub(0.5).abs().smoothstep(0.024, 0.012)

  // const lineMask = uv().y.sub(0.5).abs().smoothstep(0.05, 0.55)

  // line.mulAssign(lineMask)

  const lineSpeed = time.mul(0.05)
  const lineVisibility = step(0.79, sin(uv().x.add(lineSpeed).mul(Math.PI * 4)).abs())
  lineVisibility.addAssign(step(0.82, sin(uv().x.add(lineSpeed).mul(Math.PI * 11)).abs()))
  lineVisibility.addAssign(step(0.9, sin(uv().x.add(lineSpeed).mul(Math.PI * 24)).abs()))

  const lineTop = step(0.015, uv().y.sub(0.85).abs()).oneMinus()
  lineTop.mulAssign(lineVisibility)

  lineVisibility.assign(step(0.97, sin(uv().x.add(lineSpeed.mul(0.95)).mul(Math.PI * 4)).abs()))
  lineVisibility.addAssign(step(0.84, sin(uv().x.add(lineSpeed.mul(0.95)).mul(Math.PI * 11)).abs()))
  lineVisibility.addAssign(step(0.85, sin(uv().x.add(lineSpeed.mul(0.95)).mul(Math.PI * 24)).abs()))

  const lineBottom = step(0.015, uv().y.sub(0.15).abs()).oneMinus()
  lineBottom.mulAssign(lineVisibility)

  // Main texture
  const mapUV = uv().toVar()
  mapUV.x.mulAssign(3)
  mapUV.x.addAssign(time.mul(0.06))

  const tex = texture(map.value, mapUV).toVec3()

  // Final color
  const col = tex
  col.addAssign(lineTop)
  col.addAssign(lineBottom)
  col.assign(mix(black, col, colorFactor))

  return col
})()
