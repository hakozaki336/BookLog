import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api, ensureSanctumCsrf } from '../lib/api'

export function AuthPanel() {
  const { user, setUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [mode, setMode] = useState<'login' | 'register'>('login')

  const [loginEmail, setLoginEmail] = useState('test@example.com')
  const [loginPassword, setLoginPassword] = useState('password')

  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPassword2, setRegPassword2] = useState('')

  async function submitLogin(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      await ensureSanctumCsrf()
      const { data } = await api.post('/api/login', {
        email: loginEmail,
        password: loginPassword,
      })
      setUser(data)
      setMessage('ログインしました')
    } catch (err: unknown) {
      setMessage(formatError(err))
    } finally {
      setLoading(false)
    }
  }

  async function submitRegister(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      await ensureSanctumCsrf()
      const { data } = await api.post('/api/register', {
        name: regName,
        email: regEmail,
        password: regPassword,
        password_confirmation: regPassword2,
      })
      setUser(data)
      setMessage('登録してログインしました')
    } catch (err: unknown) {
      setMessage(formatError(err))
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    setMessage(null)
    setLoading(true)
    try {
      await ensureSanctumCsrf()
      await api.post('/api/logout')
      setUser(null)
      setMessage('ログアウトしました')
    } catch (err: unknown) {
      setMessage(formatError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-panel" aria-labelledby="auth-heading">
      <h2 id="auth-heading">Sanctum SPA（セッション）</h2>
      <p className="auth-hint">
        API: <code>{api.defaults.baseURL}</code>
      </p>
      {user ? (
        <div className="auth-user">
          <p>
            ログイン中: <strong>{user.name}</strong>（{user.email}）
          </p>
          <button type="button" onClick={() => void logout()} disabled={loading}>
            ログアウト
          </button>
        </div>
      ) : mode === 'login' ? (
        <form onSubmit={(e) => void submitLogin(e)} className="auth-form">
          <label>
            メール
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label>
            パスワード
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            ログイン
          </button>
          <p className="auth-switch">
            <button type="button" onClick={() => setMode('register')}>
              新規登録へ
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={(e) => void submitRegister(e)} className="auth-form">
          <label>
            名前
            <input
              type="text"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              autoComplete="name"
              required
            />
          </label>
          <label>
            メール
            <input
              type="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label>
            パスワード
            <input
              type="password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
          <label>
            パスワード（確認）
            <input
              type="password"
              value={regPassword2}
              onChange={(e) => setRegPassword2(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            登録
          </button>
          <p className="auth-switch">
            <button type="button" onClick={() => setMode('login')}>
              ログインへ
            </button>
          </p>
        </form>
      )}
      {message ? <p className="auth-message">{message}</p> : null}
      <p className="auth-devhint">
        初回は <code>php artisan db:seed</code> で{' '}
        <code>test@example.com</code> / <code>password</code> を作成できます。
      </p>
    </section>
  )
}

function formatError(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const res = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
    const data = res.response?.data
    if (data?.errors) {
      return Object.values(data.errors)
        .flat()
        .join(' ')
    }
    if (typeof data?.message === 'string') {
      return data.message
    }
  }
  return 'リクエストに失敗しました'
}
