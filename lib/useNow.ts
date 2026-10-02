'use client'

import { useSyncExternalStore } from 'react'

// Shared clocks (one per interval), so time-based UI stays pure during render
type Clock = { now: number; listeners: Set<() => void>; timer: ReturnType<typeof setInterval> | null; subscribe: (l: () => void) => () => void; read: () => number }
const clocks = new Map<number, Clock>()

const clock = (every: number) => {
  const existing = clocks.get(every)
  if (existing) return existing
  const c: Clock = {
    now: 0,
    listeners: new Set(),
    timer: null,
    read: () => c.now || (c.now = Date.now()),
    subscribe: (l) => {
      c.listeners.add(l)
      if (!c.timer) {
        c.now = Date.now()
        c.timer = setInterval(() => {
          c.now = Date.now()
          c.listeners.forEach((fn) => fn())
        }, every)
      }
      return () => {
        c.listeners.delete(l)
        if (c.listeners.size === 0 && c.timer) {
          clearInterval(c.timer)
          c.timer = null
        }
      }
    },
  }
  clocks.set(every, c)
  return c
}

const serverNow = () => 0

/** The current time in ms, updated every `every` ms (5 seconds by default; 0 during server rendering) */
export const useNow = (every = 5000) => {
  const c = clock(every)
  return useSyncExternalStore(c.subscribe, c.read, serverNow)
}
