const API_BASE = window.location.origin

export const getAuthHeader = () => {
  const token = localStorage.getItem('jwt_token')
  if (!token) return {}
  return { 'Authorization': 'Bearer ' + token }
}

export const getTurnstileHeader = () => {
  const token = localStorage.getItem('turnstile_token')
  if (token) {
    return { 'X-Turnstile-Token': token }
  }
  return {}
}

export const isAdminLoggedIn = () => {
  return !!localStorage.getItem('jwt_token')
}

export const formatBytes = (bytes) => {
  bytes = parseFloat(bytes) || 0
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const fetchServers = async () => {
  const res = await fetch(`${API_BASE}/api/servers`, {
    headers: {
      ...getAuthHeader(),
      ...getTurnstileHeader()
    }
  })
  if (res.status === 401) {
    window.location.href = '/admin'
    return null
  }
  if (res.status === 403) {
    localStorage.removeItem('turnstile_token')
    window.location.reload()
    return null
  }
  if (!res.ok) throw new Error('Failed to fetch')
  return await res.json()
}

export const fetchServerDetail = async (id) => {
  const res = await fetch(`${API_BASE}/api/server?id=${id}`, {
    headers: {
      ...getAuthHeader(),
      ...getTurnstileHeader()
    }
  })
  if (res.status === 401) {
    window.location.href = '/admin'
    return null
  }
  if (res.status === 403) {
    localStorage.removeItem('turnstile_token')
    window.location.reload()
    return null
  }
  if (!res.ok) throw new Error('Failed to fetch')
  return await res.json()
}

export const fetchServerHistory = async (id, metric, hours) => {
  const res = await fetch(`${API_BASE}/api/history?id=${id}&metric=${metric}&hours=${hours}`, {
    headers: {
      ...getAuthHeader(),
      ...getTurnstileHeader()
    }
  })
  if (res.status === 401) {
    window.location.href = '/admin'
    return []
  }
  if (res.status === 403) {
    localStorage.removeItem('turnstile_token')
    window.location.reload()
    return []
  }
  if (!res.ok) return []
  return await res.json()
}

export const fetchAllHistory = async (id, hours) => {
  const res = await fetch(`${API_BASE}/api/history/all?id=${id}&hours=${hours}`, {
    headers: {
      ...getAuthHeader(),
      ...getTurnstileHeader()
    }
  })
  if (res.status === 401) {
    window.location.href = '/admin'
    return null
  }
  if (res.status === 403) {
    localStorage.removeItem('turnstile_token')
    window.location.reload()
    return null
  }
  if (!res.ok) return null
  return await res.json()
}

export const adminApi = async (data) => {
  const res = await fetch(`${API_BASE}/admin/api`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...getTurnstileHeader()
    },
    body: JSON.stringify(data)
  })
  if (res.status === 401) {
    localStorage.removeItem('jwt_token')
    window.location.href = '/admin'
  }
  return res
}

export const login = async (username, password, turnstileToken = '') => {
  const headers = {
    'Content-Type': 'application/json'
  }
  if (turnstileToken) {
    headers['X-Turnstile-Token'] = turnstileToken
  }
  const res = await fetch(`${API_BASE}/admin/api`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: 'login', username, password })
  })
  if (res.ok) {
    const data = await res.json()
    if (data.token) {
      localStorage.setItem('jwt_token', data.token)
    }
  }
  return res
}

export const logout = () => {
  localStorage.removeItem('jwt_token')
}

export const fetchConfig = async () => {
  const res = await fetch(`${API_BASE}/api/config`)
  if (!res.ok) return null
  return await res.json()
}

export const upgradeDatabase = async () => {
  const res = await fetch(`${API_BASE}/updateDatabase`, {
    headers: getAuthHeader()
  })
  if (!res.ok) {
    if (res.status === 401) {
      return { success: false, error: 'Unauthorized' }
    }
    return { success: false, error: 'Request failed' }
  }
  return await res.json()
}

export const rebuildDatabase = async () => {
  const res = await fetch(`${API_BASE}/rebuild`, {
    headers: getAuthHeader()
  })
  if (!res.ok) {
    if (res.status === 401) {
      return { success: false, error: 'Unauthorized' }
    }
    return { success: false, error: 'Request failed' }
  }
  return await res.json()
}