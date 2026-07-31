import type { ProviderConfig, ProviderId } from './types'

// Prototype storage. Real tokens belong in Railway env + a server proxy;
// this keeps a demo config in the browser so the flow is testable without keys.
const KEY = 'uzb.integrations'
const ACTIVE_KEY = 'uzb.integrations.active'

type Store = Partial<Record<ProviderId, ProviderConfig>>

export function loadConfigs(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as Store
  } catch {
    return {}
  }
}

export function getConfig(id: ProviderId): ProviderConfig {
  return loadConfigs()[id] || {}
}

export function saveConfig(id: ProviderId, cfg: ProviderConfig) {
  const all = loadConfigs()
  all[id] = cfg
  try {
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    /* ignore */
  }
}

export function clearConfig(id: ProviderId) {
  const all = loadConfigs()
  delete all[id]
  try {
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    /* ignore */
  }
}

export function getActiveProvider(): ProviderId {
  const v = (() => {
    try {
      return localStorage.getItem(ACTIVE_KEY)
    } catch {
      return null
    }
  })()
  return (v as ProviderId) || 'didox'
}

export function setActiveProvider(id: ProviderId) {
  try {
    localStorage.setItem(ACTIVE_KEY, id)
  } catch {
    /* ignore */
  }
}
