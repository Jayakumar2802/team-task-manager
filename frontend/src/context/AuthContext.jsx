import { createContext, useContext, useState, useEffect } from 'react'
import { usersAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
      usersAPI.getMe()
        .then(res => setUser(res.data))
        .catch(err => {
          if (err.response?.status === 401) {
            setToken(null)
            setUser(null)
            localStorage.removeItem('token')
          }
        })
    } else {
      localStorage.removeItem('token')
      setUser(null)
    }
  }, [token])

  const login = (newToken) => {
    setToken(newToken)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }

  const setUserData = (userData) => {
    setUser(userData)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, setUserData }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}