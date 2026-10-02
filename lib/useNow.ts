'use client'

import { useSyncExternalStore } from 'react'

// One shared clock that ticks every few seconds, so time-based UI stays pure during render
let now = 0
const listeners = new Set<() => void>()
let timer: ReturnType<typeof setInterval> | null = null

const subscribe = (l: () => void) => {
  listeners.add(l)
  if (!timer) {
    now = Date.now()
    timer = setInterval(() => {
      now = Date.now()
      listeners.forEach((fn) => fn())
    }, 5000)
  }
  return () => {
    listeners.delete(l)
    if (listeners.size === 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }
}

/** The current time in ms, updated every 5 seconds (0 during server rendering) */
export const useNow = () => useSyncExternalStore(subscribe, () => now || (now = Date.now()), () => 0)
