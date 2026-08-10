import { useSyncExternalStore } from 'react'
import { subscribe, getSnapshot, platform, browser, iosSafari, supportsNativePrompt, promptInstall } from '../lib/pwa'

// Reactive access to install state plus the (static) platform facts.
export function usePwaInstall() {
  const { canInstall, installed } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return { canInstall, installed, platform, browser, iosSafari, supportsNativePrompt, promptInstall }
}
