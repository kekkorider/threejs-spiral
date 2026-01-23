import {
  Fn,
  If,
  positionLocal,
  positionWorld,
  uniform,
  uv,
  vec2,
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
  float,
  normalWorld,
  cameraPosition,
  dot,
  time,
  texture,
  matcapUV
} from 'three/tsl'
import { MeshBasicNodeMaterial, DoubleSide, DataTexture, RedFormat, FloatType } from 'three/webgpu'
import { easeInOutQuad } from 'tsl-easings'

const dummyTexture = new DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1)
dummyTexture.format = RedFormat
dummyTexture.type = FloatType
dummyTexture.needsUpdate = true

export const CylinderMaterial = new MeshBasicNodeMaterial({
  side: DoubleSide,
  forceSinglePass: true
})

export const mapA = uniform(dummyTexture)
export const mapB = uniform(dummyTexture)
export const matcap = uniform(dummyTexture)
export const matcapStrength = uniform(0.4)
export const distortA = uniform(0)
export const distortB = uniform(0)
export const fresnelPower = uniform(2.3)
export const colorA = uniform(color(0.59, 0.25, 0.29))
export const colorB = uniform(color(0.56, 0.27, 0.56))
export const colorC = uniform(color(1, 1, 1))
export const colorD = uniform(color(0.02, 0.29, 0.54))

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
  const matcapTexture = texture(matcap.value, matcapUV).toVec3()
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

  // Lines
  const lineMask = smoothstep(0.03, 0.04, uv().y.sub(0.22).abs()).oneMinus()
  line.mulAssign(lineMask)

  const lineBottom = smoothstep(0.033, 0.03, uv().y)

  // Main texture
  const mapUV = select(frontFacing, uv().toVar(), vec2(uv().x.oneMinus(), uv().y))
  const mapDirection = select(frontFacing, 1, -1)
  mapUV.y.subAssign(0.14)
  mapUV.x.mulAssign(3)
  mapUV.x.addAssign(time.mul(0.06).mul(mapDirection))

  const texA = texture(mapA.value, mapUV).toVec3()
  const texB = texture(mapB.value, mapUV).toVec3()

  const col = matcapTexture.mul(matcapStrength)

  // Final color
  If(frontFacing, () => {
    col.addAssign(texA.toVec3())
  }).Else(() => {
    col.addAssign(texB.toVec3())
  })

  col.addAssign(line)
  // col.addAssign(lineBottom)
  col.assign(mix(black, col, colorFactor))

  // col.mulAssign(noise)

  return col
})()
