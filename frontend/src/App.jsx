import React, { useState, useEffect } from 'react'
import { login, signup, getCurrentUser } from './api'
import Dashboard from './Dashboard'
import './index.css'
import { LogOut } from 'lucide-react'

export default function App() {
  const [user, setUser] = useState(null)
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
      } catch (err) {
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.target)

    try {
      const data = isLogin
        ? await login(formData.get('email'), formData.get('password'))
        : await signup(formData.get('name'), formData.get('email'), formData.get('password'))

      localStorage.setItem('token', data.token)
      setUser(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
          {error && <div className="error">{error}</div>}

          <form onSubmit={handleAuth}>
            {!isLogin && (
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" required />
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" required />
            </div>
            <button type="submit" className="btn-primary">
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <a onClick={() => { setIsLogin(!isLogin); setError(''); }}>
                {isLogin ? ' Sign Up' : ' Login'}
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="header">
        <div>
          <h2>Task Manager</h2>
          <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
            Welcome, {user.name} ({user.role})
          </p>
        </div>
        <button className="btn-logout" onClick={logout}>
          <LogOut size={18} style={{ marginRight: '8px' }} />
          Logout
        </button>
      </div>
      <Dashboard user={user} />
    </div>
  )
}
