import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

type SecretPayload = {
  message: string
  issued_at: string
  user: { id: number; name: string; email: string }
}

export function MembersOnly() {
  const { user, loading } = useAuth()
  const [secret, setSecret] = useState<SecretPayload | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!user) {
      setSecret(null)
      setFetchError(null)
      return
    }

    setPending(true)
    setFetchError(null)
    api
      .get<SecretPayload>('/api/members/secret')
      .then((res) => setSecret(res.data))
      .catch(() => {
        setSecret(null)
        setFetchError('サーバーからの取得に失敗しました（未認証の可能性）')
      })
      .finally(() => setPending(false))
  }, [user])

  if (loading) {
    return (
      <section className="members-only" aria-busy="true">
        <p>認証状態を確認しています…</p>
      </section>
    )
  }

  if (!user) {
    return (
      <section className="members-only members-only--locked" aria-labelledby="members-locked">
        <h2 id="members-locked">会員専用エリア</h2>
        <div className="members-only__wall">
          <p>この先はログインしたユーザーのみ閲覧できます。</p>
          <p className="members-only__hint">
            ナビの「ホーム」に切り替え、Sanctum のフォームからログインすると閲覧できます。
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="members-only" aria-labelledby="members-open">
      <h2 id="members-open">会員専用エリア</h2>
      <p className="members-only__welcome">
        ようこそ、<strong>{user.name}</strong> さん
      </p>
      {pending ? (
        <p>サーバーからデータを取得中…</p>
      ) : fetchError ? (
        <p className="members-only__error">{fetchError}</p>
      ) : secret ? (
        <div className="members-only__content">
          <p>{secret.message}</p>
          <dl className="members-only__meta">
            <dt>発行時刻（サーバー）</dt>
            <dd>
              <code>{secret.issued_at}</code>
            </dd>
            <dt>API が返したユーザー</dt>
            <dd>
              <code>{secret.user.email}</code>
            </dd>
          </dl>
        </div>
      ) : null}
    </section>
  )
}
