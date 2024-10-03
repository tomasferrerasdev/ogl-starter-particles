"use client"
import * as OGL from "ogl"
import { useLayoutEffect, useState } from "react"
import { RootState } from "react-ogl"
import { useFrame, useOGL } from "react-ogl"

import { fragment, positionFragment, velocityFragment, vertex } from "./shaders"

const numParticles = 65536
const initialPositionData = new Float32Array(numParticles * 4)
const initialVelocityData = new Float32Array(numParticles * 4)
const random = new Float32Array(numParticles * 4)

for (let i = 0; i < numParticles; i++) {
  initialPositionData.set(
    [(Math.random() - 0.5) * 2.0, (Math.random() - 0.5) * 2.0, 0, 1],
    i * 4
  )
  initialVelocityData.set([0, 0, 0, 1], i * 4)
  random.set(
    [Math.random(), Math.random(), Math.random(), Math.random()],
    i * 4
  )
}

function useGPGPU(data: any) {
  const { gl } = useOGL()
  const [gpgpu] = useState(() => new OGL.GPGPU(gl, { data }))
  useFrame(() => gpgpu.render())
  return gpgpu
}

export const AnimatedGradient = ({ time = 0 }) => {
  const { gl } = useOGL()
  const [mouse] = useState(() => new OGL.Vec2())
  const position = useGPGPU(initialPositionData)
  const velocity = useGPGPU(initialVelocityData)

  useLayoutEffect(() => {
    position.addPass({
      fragment: positionFragment,
      uniforms: { uTime: { value: time }, tVelocity: velocity.uniform }
    })
    velocity.addPass({
      fragment: velocityFragment,
      uniforms: {
        uTime: { value: time },
        uMouse: { value: mouse },
        tPosition: position.uniform
      }
    })

    const handleMouseMove = (e: MouseEvent) => {
      mouse.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      )
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [position, velocity, mouse, time])

  useFrame((state: RootState, t: number) => {
    const currentTime = t * 0.001
    position.passes[0].uniforms.uTime.value = currentTime
    velocity.passes[0].uniforms.uTime.value = currentTime
  })

  return (
    <mesh mode={gl.POINTS}>
      <geometry
        random={{ size: 4, data: random }}
        coords={{ size: 2, data: position.coords }}
      />
      <program
        vertex={vertex}
        fragment={fragment}
        uniforms={{
          uTime: { value: time },
          tPosition: position.uniform,
          tVelocity: velocity.uniform
        }}
      />
    </mesh>
  )
}
