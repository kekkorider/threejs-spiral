import {
  Fn,
  If,
  positionLocal,
  positionWorld,
  uniform,
  uv,
  vec2,
  vec3,
  frontFacing,
  select,
  clamp,
  mx_cell_noise_float,
  color,
  mix,
  mul,
  cos,
  smoothstep,
  instanceIndex,
  step,
  float,
  normalWorld,
  cameraPosition,
  dot,
  time,
  texture
} from 'three/tsl'
import { MeshBasicNodeMaterial, DoubleSide, DataTexture, RedFormat, FloatType } from 'three/webgpu'
import { easeInOutQuad } from 'tsl-easings'

export const CylinderMaterial = new MeshBasicNodeMaterial({
  side: DoubleSide,
  forceSinglePass: true
})

const dummyTexture = new DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1)
dummyTexture.format = RedFormat
dummyTexture.type = FloatType
dummyTexture.needsUpdate = true

export const mapA = uniform(dummyTexture)
export const mapB = uniform(dummyTexture)
export const distortA = uniform(0)
export const distortB = uniform(0)
export const fresnelPower = uniform(1.15)
export const colorA = uniform(color(0.2, 0.4, 0.5))
export const colorB = uniform(color(0.3, 0.5, 0.2))
export const colorC = uniform(color(0.9, 0.5, 0.2))
export const colorD = uniform(color(0.7, 0.7, 0.2))

export const INSTANCE_COUNT = 16

export const palette = Fn( ( [ t, a, b, c, d ] ) => {

	return a.add( b.mul( cos( mul( 6.283185, c.mul( t ).add( d ) ) ) ) );

}, { t: 'float', a: 'vec3', b: 'vec3', c: 'vec3', d: 'vec3', return: 'vec3' } );

CylinderMaterial.positionNode = Fn(() => {
  const pos = positionLocal

  const xA = uv().x
  const xB = uv().x.oneMinus()

  const i = instanceIndex.toFloat()
  const instanceT = i.div(float(INSTANCE_COUNT).sub(1).max(1))

  // per-instance delayed progress
  const localDistortA = easeInOutQuad(distortA)
    .sub(instanceT)
    .div(float(1).sub(instanceT))
    .clamp(0, 1)

  const localDistortB = easeInOutQuad(distortB)
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

  // Noise
  const noise = mx_cell_noise_float(uv().mul(vec2(1, 11))).toVar()
  noise.x.assign(clamp(noise.x, 0.2, 0.95))

  const line = palette(uv().x.add(time.mul(0.06)).mul(10), colorA, colorB, colorC, colorD)

  // Line
  const lineMask = step(0.05, uv().y.sub(0.22).abs()).oneMinus()
  line.mulAssign(lineMask)

  // Main texture
  const mapUV = select(frontFacing, uv().toVar(), vec2(uv().x.oneMinus(), uv().y))
  const mapDirection = select(frontFacing, 1, -1)
  mapUV.y.subAssign(0.08)
  mapUV.x.mulAssign(3)
  mapUV.x.addAssign(time.mul(0.06).mul(mapDirection))

  const texA = texture(mapA.value, mapUV).toVec3()
  const texB = texture(mapB.value, mapUV).toVec3()

  const col = vec3()

  // Final color
  If(frontFacing, () => {
    col.assign(texA.toVec3())
  }).Else(() => {
    col.assign(texB.toVec3())
  })

  col.addAssign(line)
  col.assign(mix(black, col, colorFactor))

  // col.mulAssign(noise)

  return col
})()
