"use client"

import { AnimatedGradient } from "~/gl/components/animated-gradient"
import { WebGL } from "~/gl/tunnel"

export const Welcome = () => {
  return (
    <div className="min-h-screen mx-auto pt-20 [&p+p]:mt-2 [&>a]:underline text-white py-18 z-10 [--rounded-lg:8px] [--rounded-md:4px]">
      <WebGL.In id="animated-gradient">
        <AnimatedGradient />
      </WebGL.In>
    </div>
  )
}
