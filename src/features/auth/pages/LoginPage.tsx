import axios from 'axios'
import { useState, type FormEvent } from 'react'
import { Alert, Button, Input } from 'antd'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../../../shared/assets/haoxue-logo.png'
import { login, register } from '../api/authApi'
import useAuthStore from '../authStore'
import '../styles/login.css'

function LoginPage() {
  const navigate = useNavigate()
  const refreshUser = useAuthStore((state) => state.refreshUser)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')

    try {
      if (mode === 'register') {
        await register({
          email,
          password,
          name: String(formData.get('name') ?? ''),
        })
        await refreshUser()
        navigate('/', { replace: true })
        return
      }

      await login({ email, password })
      await refreshUser()
      navigate('/', { replace: true })
    } catch (error) {
      const apiMessage = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined
      setMessage(apiMessage || (error instanceof Error ? error.message : 'Đã xảy ra lỗi. Vui lòng thử lại.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <Link className="login-brand" to="/" aria-label="HaoXueStudy trang chủ">
          <img src={logo} alt="" />
          <span>HaoXue<span>Study</span></span>
        </Link>

        <div className="login-heading">
          {/* <span className="login-icon" aria-hidden="true">學</span> */}
          <p className="login-eyebrow">{mode === 'login' ? 'CHÀO MỪNG BẠN TRỞ LẠI' : 'BẮT ĐẦU HÀNH TRÌNH HỌC TẬP'}</p>
          <h1 id="login-title">{mode === 'login' ? 'Đăng nhập để tiếp tục' : 'Tạo tài khoản mới'}</h1>
          <p>{mode === 'login' ? 'Đăng nhập để truy cập bài học và hành trình tiếng Trung của bạn.' : 'Tạo tài khoản để bắt đầu hành trình học tiếng Trung.'}</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <label htmlFor="name">Họ và tên</label>
              <Input id="name" name="name" autoComplete="name" placeholder="Tên của bạn" size="large" required />
            </>
          )}
          <label htmlFor="email">Email</label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="ten@email.com" size="large" required />

          {mode === 'login' && (
            <div className="password-label">
              <label htmlFor="password">Mật khẩu</label>
              <button type="button" onClick={() => setMessage('Vui lòng liên hệ hỗ trợ để khôi phục mật khẩu.')}>
                Quên mật khẩu?
              </button>
            </div>
          )}
          {mode === 'register' && <label htmlFor="password">Mật khẩu</label>}
          <Input.Password id="password" name="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="Nhập mật khẩu" size="large" iconRender={(visible) => visible ? <EyeOff size={16} /> : <Eye size={16} />} required />

          <Button className="login-submit" type="primary" htmlType="submit" loading={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'} <span aria-hidden="true">→</span>
          </Button>
          {message && <Alert className="login-alert" type="error" showIcon message={message} />}
        </form>

        <p className="login-footer">
          {mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
          <button className="login-mode-toggle" type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage('') }}>
            {mode === 'login' ? 'Đăng ký' : 'Đăng nhập'}
          </button>
        </p>
        <Link className="back-home" to="/">← Quay lại trang chủ</Link>
      </section>

      <aside className="login-aside" aria-label="Giới thiệu HaoXueStudy">
        <div className="login-aside-content">
          <span className="login-aside-kicker">好好學習，天天向上</span>
          <h2>Mỗi ngày một chút,<br />tiếng Trung sẽ <em>thật gần.</em></h2>
          <p>Đăng nhập để tiếp tục bài học, ôn từ vựng và theo dõi tiến độ của bạn.</p>
          <div className="login-aside-note"><span>學</span><div><strong>Học tập chăm chỉ</strong><small>Tiến bộ từng ngày</small></div></div>
        </div>
      </aside>
    </main>
  )
}

export default LoginPage
