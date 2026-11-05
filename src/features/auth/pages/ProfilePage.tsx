import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Spin } from 'antd'
import { LogOut } from 'lucide-react'
import AppLayout from '../../../shared/components/AppLayout'
import UserAvatar from '../../../shared/components/UserAvatar'
import { getCurrentUser, logout } from '../api/authApi'
import useAuthStore from '../authStore'
import '../styles/profile.css'

function ProfilePage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadProfile = useCallback(async () => {
    try {
      setUser(await getCurrentUser())
      setError('')
    } catch (requestError) {
      if (axios.isAxiosError(requestError) && requestError.response?.status === 401) {
        setUser(null)
        navigate('/login', { replace: true })
        return
      }
      setError('Không thể tải thông tin cá nhân. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }, [navigate, setUser])

  useEffect(() => {
    let active = true

    getCurrentUser()
      .then((currentUser) => {
        if (!active) return
        setUser(currentUser)
        setError('')
      })
      .catch((requestError: unknown) => {
        if (!active) return
        if (axios.isAxiosError(requestError) && requestError.response?.status === 401) {
          setUser(null)
          navigate('/login', { replace: true })
          return
        }
        setError('Không thể tải thông tin cá nhân. Vui lòng thử lại.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => { active = false }
  }, [navigate, setUser])

  function retryProfile() {
    setIsLoading(true)
    setError('')
    void loadProfile()
  }

  async function handleLogout() {
    await logout().catch(() => null)
    setUser(null)
    navigate('/login', { replace: true })
  }

  return (
    <AppLayout>
    <main className="main-content profile-page">
      <section className="profile-page-content mx-auto w-full max-w-3xl px-5" aria-labelledby="profile-page-title">
        <div className="profile-page-heading">
          <span className="eyebrow">TÀI KHOẢN HAOXUESTUDY</span>
          <h1 id="profile-page-title">Thông tin cá nhân</h1>
          <p>Thông tin tài khoản học tập của bạn.</p>
        </div>

        {isLoading ? (
          <div className="profile-page-state"><Spin /> <span>Đang tải thông tin...</span></div>
        ) : error ? (
          <Alert className="profile-page-error" type="error" showIcon message={error} action={<Button type="link" onClick={retryProfile}>Thử lại</Button>} />
        ) : user && (
          <Card className="profile-page-card" bordered={false}>
            <div className="profile-page-identity">
              <UserAvatar className="profile-page-avatar" avatarUrl={user.avatarUrl} alt="Ảnh đại diện" />
              <div><h2>{user.name || user.username}</h2><p>{user.email}</p></div>
            </div>
            <dl className="profile-page-details">
              <div><dt>Họ và tên</dt><dd>{user.name || 'Chưa cập nhật'}</dd></div>
              <div><dt>Tên đăng nhập</dt><dd>{user.username}</dd></div>
              <div><dt>Email</dt><dd>{user.email}</dd></div>
              <div><dt>Vai trò</dt><dd>{user.role === 'ADMIN' ? 'Quản trị viên' : 'Học viên'}</dd></div>
              <div><dt>Ngày tham gia</dt><dd>{user.createdAt ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(new Date(user.createdAt)) : '—'}</dd></div>
            </dl>
            <div className="profile-page-actions">
              <Link to="/">Quay lại học</Link>
              <Button danger icon={<LogOut size={15} aria-hidden="true" />} onClick={handleLogout}>Đăng xuất</Button>
            </div>
          </Card>
        )}
      </section>
    </main>
    </AppLayout>
  )
}

export default ProfilePage
