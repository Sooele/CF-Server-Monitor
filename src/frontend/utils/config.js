// Frontend runtime configuration loader.
// Reads /config.json on app startup, exposes the API base URL globally,
// and falls back to the current page origin when the file is missing,
// unreadable, or contains an empty apiBase value.

let apiBase = null
let wsBase = null

const stripTrailingSlash = (s) => String(s || '').replace(/\/+$/, '')

const toOrigin = (value) => {
  try {
    const u = new URL(value)
    return `${u.protocol}//${u.host}`
  } catch (_) {
    return null
  }
}

const computeWsBase = (origin) => {
  try {
    const u = new URL(origin)
    const wsProto = u.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${wsProto}//${u.host}`
  } catch (_) {
    return `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
  }
}

const setApiBase = (value) => {
  const cleaned = stripTrailingSlash(value)
  apiBase = cleaned || stripTrailingSlash(window.location.origin)
  wsBase = computeWsBase(apiBase)
  // Expose for debugging / non-module consumers
  window.__APP_API_BASE__ = apiBase
  window.__APP_WS_BASE__ = wsBase
  return apiBase
}

export const initConfig = async () => {
  // Default to current origin in case the fetch fails
  setApiBase(window.location.origin)
  try {
    const res = await fetch(`/config.json?t=${Date.now()}`, {
      cache: 'no-cache',
      credentials: 'omit'
    })
    if (res && res.ok) {
      const data = await res.json()
      if (data && typeof data.apiBase === 'string' && data.apiBase.trim()) {
        setApiBase(data.apiBase.trim())
      }
    }
  } catch (e) {
    // Network or parse failure -> keep the current-origin fallback
  }
  return apiBase
}

export const getApiBase = () => {
  if (apiBase) return apiBase
  if (window.__APP_API_BASE__) return window.__APP_API_BASE__
  return stripTrailingSlash(window.location.origin)
}

export const getWsBase = () => {
  if (wsBase) return wsBase
  if (window.__APP_WS_BASE__) return window.__APP_WS_BASE__
  return computeWsBase(getApiBase())
}

export default { initConfig, getApiBase, getWsBase }
