"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { useEffect } from "react"
import { useMedia } from "react-use"

import { useAppStore } from "~/context/use-app-store"
import { useDocumentLoad } from "~/hooks/use-document-load"
import { basementLog, isClient, isDev, isProd } from "~/lib/constants"

gsap.registerPlugin(useGSAP)

export const AppHooks = () => {
  // TODO delete this basement log if not a basement project.
  if (isProd && isClient) {
    // eslint-disable-next-line no-console
    console.log(basementLog)
  }

  useDocumentLoad()
  useReducedMotion()
  useOverflowDebuggerInDev()
  useUserIsTabbing()
  useFontsLoaded()

  return null
}

/* APP HOOKS */

const useReducedMotion = () => {
  const reducedMotion = useMedia("(prefers-reduced-motion: reduce)", false)
  useEffect(() => {
    if (reducedMotion === undefined) return
    useAppStore.setState({ reducedMotion })
  }, [reducedMotion])
}

const useOverflowDebuggerInDev = () => {
  useEffect(() => {
    if (!isDev) return
    let mousetrapRef: Mousetrap.MousetrapInstance | undefined = undefined
    import("mousetrap").then(({ default: mousetrap }) => {
      mousetrapRef = mousetrap.bind(["command+i", "ctrl+i", "alt+i"], () => {
        document.body.classList.toggle("inspect")
      })
    })

    return () => {
      mousetrapRef?.unbind(["command+i", "ctrl+i", "alt+i"])
    }
  }, [])
}

const useUserIsTabbing = () => {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.code === `Tab`) {
        document.body.classList.add("user-is-tabbing")
      }
    }

    function handleMouseDown() {
      document.body.classList.remove("user-is-tabbing")
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("mousedown", handleMouseDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("mousedown", handleMouseDown)
    }
  }, [])
}

const useFontsLoaded = () => {
  useEffect(() => {
    const maxWaitTime = 1500 // tweak this as needed.

    const timeout = window.setTimeout(() => {
      onReady()
    }, maxWaitTime)

    function onReady() {
      window.clearTimeout(timeout)
      useAppStore.setState({ fontsLoaded: true })
      document.documentElement.classList.add("fonts-loaded")
    }

    try {
      document.fonts.ready
        .then(() => {
          onReady()
        })
        .catch((error: unknown) => {
          console.error(error)
          onReady()
        })
    } catch (error) {
      console.error(error)
      onReady()
    }
  }, [])
}
