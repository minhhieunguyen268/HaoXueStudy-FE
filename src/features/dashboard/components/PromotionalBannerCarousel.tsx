import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import './promotional-banner-carousel.css'
import StudyStartBanner from './StudyStartBanner'

const slides = [
  {
    eyebrow: 'HÀNH TRÌNH TIẾNG TRUNG ĐÀI LOAN',
    title: <>Học theo từng chặng,<br /><em>nhớ theo từng bài.</em></>,
    description: 'Học tiếng Trung phồn thể qua 15 bài của Giáo trình Đương Đại 1.',
    action: 'Khám phá từ vựng',
    theme: 'green',
    art: <><span className="promo-character-main">學</span><span className="promo-character-small">好</span><span className="promo-art-label">xué · học</span></>,
  },
  {
    eyebrow: 'LUYỆN VIẾT CHỮ HÁN',
    title: <>Viết đúng thứ tự nét,<br /><em>nhớ chữ lâu hơn.</em></>,
    description: 'Quan sát từng nét và thực hành ngay với chữ phồn thể.',
    action: 'Luyện viết ngay',
    theme: 'peach',
    art: <><span className="promo-character-main">筆</span><span className="promo-character-small">順</span><span className="promo-art-label">từng nét một</span></>,
  },
  {
    eyebrow: 'NGHE VÀ LUYỆN PHÁT ÂM',
    title: <>Nghe rõ cách đọc,<br /><em>ghi nhớ tự nhiên.</em></>,
    description: 'Nghe từ vựng tiếng Quan Thoại rồi luyện đọc theo.',
    action: 'Luyện phát âm',
    theme: 'blue',
    art: <><span className="promo-hello">你好</span><span className="promo-art-label">nǐ hǎo · xin chào</span></>,
  },
  { theme: 'study', content: <StudyStartBanner /> },
]

function PromotionalBannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    if (paused) return
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length)
    }, 5200)
    return () => window.clearInterval(timer)
  }, [paused])

  function moveBy(amount: number) {
    setActiveIndex((index) => (index + amount + slides.length) % slides.length)
  }

  return (
    <section
      className="promo-carousel"
      aria-label="Khám phá HaoXueStudy"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false)
      }}
    >
      <div
        className="promo-viewport"
        onTouchStart={(event) => { touchStartX.current = event.changedTouches[0]?.clientX ?? null }}
        onTouchEnd={(event) => {
          const start = touchStartX.current
          const end = event.changedTouches[0]?.clientX
          touchStartX.current = null
          if (start === null || end === undefined) return
          const distance = start - end
          if (Math.abs(distance) > 42) moveBy(distance > 0 ? 1 : -1)
        }}
      >
        <div className="promo-track">
          {slides.map((slide, index) => {
            const isActive = index === activeIndex
            return (
              <article
                className={`promo-slide promo-slide-${slide.theme} ${isActive ? 'is-active' : ''}`}
                key={slide.theme}
                aria-hidden={!isActive}
                aria-roledescription="trang trình chiếu"
                aria-label={`${index + 1} trên ${slides.length}`}
                inert={!isActive}
              >
                {slide.content ?? (<>
                <div className="promo-copy">
                  <span className="promo-eyebrow"><i /><span>{slide.eyebrow}</span></span>
                  <h2>{slide.title}</h2>
                  <p>{slide.description}</p>
                  <Link className="promo-cta" to={slide.theme === 'blue' ? '/pronunciation' : '/vocabulary'}>
                    {slide.action}<ArrowRight aria-hidden="true" />
                  </Link>
                </div>
                <div className="promo-art" aria-hidden="true">
                  <span className="promo-art-orbit promo-art-orbit-one" />
                  <span className="promo-art-orbit promo-art-orbit-two" />
                  <span className="promo-art-spark promo-art-spark-one">✦</span>
                  <span className="promo-art-spark promo-art-spark-two">✳</span>
                  <div className="promo-art-card">{slide.art}</div>
                </div>
                </>)}
              </article>
            )
          })}
        </div>
      </div>

      <div className="promo-controls" aria-label="Điều hướng banner">
        <div className="promo-dots" role="group" aria-label="Chọn banner">
          {slides.map((slide, index) => (
            <button
              className={`promo-dot ${index === activeIndex ? 'is-active' : ''}`}
              key={slide.theme}
              type="button"
              aria-label={`Hiện banner ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
        <div className="promo-arrows">
          <button type="button" aria-label="Banner trước" onClick={() => moveBy(-1)}><ChevronLeft aria-hidden="true" /></button>
          <button type="button" aria-label="Banner tiếp theo" onClick={() => moveBy(1)}><ChevronRight aria-hidden="true" /></button>
        </div>
      </div>
    </section>
  )
}

export default PromotionalBannerCarousel
