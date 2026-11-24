import { useState } from 'react'
import { AudioLines, Check, ChevronDown, ChevronRight, CircleHelp, RotateCcw, Volume2, Waves } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import AppLayout from '../../../shared/components/AppLayout'
import '../styles/pronunciation.css'

type Tone = { number: number | null; label: string; chineseLabel: string; mark: string; quality: string; example: string; exampleMeaning: string; color: string }
type QuizItem = { hanzi: string; meaning: string; answer: string; choices: string[] }
type PronunciationTab = 'tones' | 'initials' | 'finals' | 'pinyin-chart' | 'practice'

const pronunciationTabs: { id: PronunciationTab; number: string; label: string }[] = [
  { id: 'tones', number: '01', label: 'Thanh điệu' },
  { id: 'initials', number: '02', label: 'Thanh mẫu' },
  { id: 'finals', number: '03', label: 'Vận mẫu' },
  { id: 'pinyin-chart', number: '04', label: 'Bảng Pinyin' },
  { id: 'practice', number: '05', label: 'Luyện tập' },
]

const tones: Tone[] = [
  { number: 1, label: 'Thanh 1 — Ngang', chineseLabel: '第一聲（陰平）', mark: '−', quality: 'Giữ giọng cao và đều, không lên xuống.', example: '媽 mā', exampleMeaning: 'mẹ', color: 'jade' },
  { number: 2, label: 'Thanh 2 — Sắc', chineseLabel: '第二聲（陽平）', mark: '／', quality: 'Bắt đầu thấp vừa rồi nâng giọng lên.', example: '麻 má', exampleMeaning: 'cây gai', color: 'blue' },
  { number: 3, label: 'Thanh 3 — Hỏi', chineseLabel: '第三聲（上聲）', mark: '∨', quality: 'Hạ giọng xuống thấp rồi nhấc lên nhẹ.', example: '馬 mǎ', exampleMeaning: 'con ngựa', color: 'amber' },
  { number: 4, label: 'Thanh 4 — Nặng', chineseLabel: '第四聲（去聲）', mark: '＼', quality: 'Hạ giọng nhanh và dứt khoát.', example: '罵 mà', exampleMeaning: 'mắng', color: 'coral' },
  { number: null, label: 'Thanh nhẹ', chineseLabel: '聲', mark: '·', quality: 'Đọc ngắn, nhẹ và không nhấn.', example: '媽 ma', exampleMeaning: 'mẹ', color: 'neutral' },
]

const toneChartData = [
  { position: 0, tone1: 5, tone2: null, tone3: null, tone4: null },
  { position: 1, tone1: 5, tone2: null, tone3: null, tone4: null },
  { position: 2, tone1: null, tone2: 3, tone3: null, tone4: null },
  { position: 3, tone1: null, tone2: 5, tone3: null, tone4: null },
  { position: 4, tone1: null, tone2: null, tone3: 2, tone4: null },
  { position: 5, tone1: null, tone2: null, tone3: 1, tone4: null },
  { position: 6, tone1: null, tone2: null, tone3: 4, tone4: null },
  { position: 7, tone1: null, tone2: null, tone3: null, tone4: 5 },
  { position: 8, tone1: null, tone2: null, tone3: null, tone4: 1 },
]

const initials = [
  { group: 'Âm môi', symbols: [['b', '波 bō'], ['p', '坡 pō'], ['m', '摸 mō'], ['f', '佛 fó']] },
  { group: 'Đầu lưỡi', symbols: [['d', '得 dé'], ['t', '特 tè'], ['n', '呢 ne'], ['l', '了 le']] },
  { group: 'Cuống lưỡi', symbols: [['g', '哥 gē'], ['k', '科 kē'], ['h', '喝 hē']] },
  { group: 'Mặt lưỡi', symbols: [['j', '雞 jī'], ['q', '七 qī'], ['x', '西 xī']] },
  { group: 'Đầu lưỡi cong', symbols: [['zh', '知 zhī'], ['ch', '吃 chī'], ['sh', '詩 shī'], ['r', '日 rì']] },
  { group: 'Đầu lưỡi trước', symbols: [['z', '資 zī'], ['c', '雌 cī'], ['s', '思 sī']] },
]

const finals = [
  { group: 'Vận mẫu đơn', symbols: [['a', '啊 ā'], ['o', '喔 ō'], ['e', '鵝 é'], ['i', '衣 yī'], ['u', '烏 wū'], ['ü', '迂 yū']] },
  { group: 'Vận mẫu kép', symbols: [['ai', '愛 ài'], ['ei', '黑 hēi'], ['ao', '好 hǎo'], ['ou', '口 kǒu'], ['ia', '家 jiā'], ['ie', '寫 xiě'], ['ua', '花 huā'], ['uo', '多 duō'], ['üe', '月 yuè']] },
  { group: 'Vận mẫu mũi', symbols: [['an', '安 ān'], ['en', '恩 ēn'], ['in', '心 xīn'], ['un', '春 chūn'], ['ün', '雲 yún'], ['ang', '忙 máng'], ['eng', '風 fēng'], ['ing', '聽 tīng'], ['ong', '中 zhōng']] },
]

const chartRows = [
  ['b', 'ba · bo · bai · bei · bao · ban · ben · bang · beng · bi · bie · biao · bian · bin · bing · bu'],
  ['p', 'pa · po · pai · pei · pao · pou · pan · pen · pang · peng · pi · pie · piao · pian · pin · ping · pu'],
  ['m', 'ma · mo · me · mai · mei · mao · mou · man · men · mang · meng · mi · mie · miao · miu · mian · min · ming · mu'],
  ['f', 'fa · fo · fei · fou · fan · fen · fang · feng · fu'],
  ['d', 'da · de · dai · dei · dao · dou · dan · dang · deng · dong · di · diao · die · diu · dian · ding · du · duo'],
  ['t', 'ta · te · tai · tao · tou · tan · tang · teng · tong · ti · tie · tiao · tian · ting · tu · tuo'],
  ['n', 'na · ne · nai · nei · nao · nuo · nan · nen · nang · neng · nong · ni · nie · niao · niu · nian · nin · ning · nu · nü · nüe'],
  ['l', 'la · le · lai · lei · lao · lou · lan · lang · leng · long · li · lia · lie · liao · liu · lian · lin · ling · lo · lu · lü · lüe'],
  ['g', 'ga · ge · gai · gei · gao · gou · gan · gen · gang · geng · gong · gu · gua · guo · guai · gui · guan · gun · guang'],
  ['k', 'ka · ke · kai · kao · kou · kan · ken · kang · keng · kong · ku · kua · kuo · kuai · kui · kuan · kun · kuang'],
  ['h', 'ha · he · hai · hei · hao · hou · han · hen · hang · heng · hong · hu · hua · huo · huai · hui · huan · hun · huang'],
  ['j', 'ji · jia · jie · jiao · jiu · jian · jin · jiang · jing · jiong · ju · jue · juan · jun'],
  ['q', 'qi · qia · qie · qiao · qiu · qian · qin · qiang · qing · qiong · qu · que · quan · qun'],
  ['x', 'xi · xia · xie · xiao · xiu · xian · xin · xiang · xing · xiong · xu · xue · xuan · xun'],
  ['zh', 'zha · zhe · zhi · zhai · zhao · zhou · zhan · zhen · zhang · zheng · zhong · zhu · zhua · zhuo · zhuai · zhui · zhuan · zhun · zhuang'],
  ['ch', 'cha · che · chi · chai · chao · chou · chan · chen · chang · cheng · chong · chu · chua · chuo · chuai · chui · chuan · chun · chuang'],
  ['sh', 'sha · she · shi · shai · shei · shao · shou · shan · shen · shang · sheng · shu · shua · shuo · shuai · shui · shuan · shun · shuang'],
  ['r', 'ri · re · rao · rou · ran · ren · rang · reng · rong · ru · ruo · rui · ruan · run'],
  ['z', 'zi · za · ze · zei · zao · zou · zan · zen · zang · zeng · zong · zu · zuo · zuan · zun'],
  ['c', 'ci · ca · ce · cai · cao · cou · can · cen · cang · ceng · cong · cu · cuo · cuan · cun'],
  ['s', 'si · sa · se · sai · sao · sou · san · sen · sang · seng · song · su · suo · suan · sun'],
  ['y / w', 'yi · ya · ye · yao · you · yan · yin · yang · ying · yong · yu · yue · yuan · yun · wa · wo · wai · wei · wan · wen · wang · weng · wu'],
]

const quiz: QuizItem[] = [
  { hanzi: '你好', meaning: 'xin chào', answer: 'nǐ hǎo', choices: ['nǐ hǎo', 'ní hāo', 'nì hǎo', 'nī hāo'] },
  { hanzi: '謝謝', meaning: 'cảm ơn', answer: 'xièxie', choices: ['xiēxiē', 'xiéxié', 'xièxie', 'xǐexiè'] },
  { hanzi: '再見', meaning: 'tạm biệt', answer: 'zàijiàn', choices: ['zāijiān', 'zàijiàn', 'zǎijiǎn', 'záijián'] },
  { hanzi: '臺灣', meaning: 'Đài Loan', answer: 'táiwān', choices: ['tāiwǎn', 'táiwān', 'tàiwàn', 'tǎiwán'] },
  { hanzi: '學生', meaning: 'học sinh', answer: 'xuéshēng', choices: ['xuéshēng', 'xuěshěng', 'xùeshèng', 'xūēshēng'] },
  { hanzi: '朋友', meaning: 'bạn bè', answer: 'péngyou', choices: ['pēngyōu', 'pěngyǒu', 'pèngyòu', 'péngyou'] },
]

const syllableSpeechSamples: Partial<Record<string, string>> = {
  pa: '趴',
}

const standaloneFinals: Record<string, string> = {
  yi: 'i', ya: 'ia', ye: 'ie', yao: 'iao', you: 'iou', yan: 'ian',
  yin: 'in', yang: 'iang', ying: 'ing', yong: 'iong',
  yu: 'ü', yue: 'üe', yuan: 'üan', yun: 'ün',
  wa: 'ua', wo: 'uo', wai: 'uai', wei: 'uei', wan: 'uan',
  wen: 'un', wang: 'uang', weng: 'ueng', wu: 'u',
}

function getSyllableFinal(initial: string, syllable: string) {
  if (initial === 'y / w') return standaloneFinals[syllable]
  const final = syllable.slice(initial.length)
  if (final === 'iu') return 'iou'
  if (final === 'ui') return 'uei'
  return /^[jqx]$/.test(initial) && final.startsWith('u')
    ? final.replace(/^u/, 'ü')
    : final
}

const pinyinMatrix = chartRows.map(([initial, syllables]) => {
  const byFinal = new Map<string, string>()
  for (const syllable of syllables.split(' · ')) {
    byFinal.set(getSyllableFinal(initial, syllable), syllable)
  }
  return { initial, byFinal }
})

const pinyinColumns = [...new Set([
  ...finals.flatMap(({ symbols }) => symbols.map(([symbol]) => symbol)),
  ...pinyinMatrix.flatMap(({ byFinal }) => [...byFinal.keys()]),
])]

function PronunciationPage() {
  const [audioError, setAudioError] = useState('')
  const [activeTab, setActiveTab] = useState<PronunciationTab>('tones')
  const [selectedInitial, setSelectedInitial] = useState('b')
  const [selectedFinal, setSelectedFinal] = useState('a')
  const [expandedTone, setExpandedTone] = useState<number | null | undefined>(undefined)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const question = quiz[questionIndex]
  const selectedInitialSyllables = chartRows.find(([initial]) => initial === selectedInitial)?.[1].split(' · ') ?? []
  const selectedFinalSyllables = chartRows.flatMap(([initial, syllables]) =>
    syllables.split(' · ').filter((syllable) => getSyllableFinal(initial, syllable) === selectedFinal),
  )
  const answeredCorrectly = selectedAnswer === question.answer

  function speak(text: string) {
    setAudioError('')
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      setAudioError('Trình duyệt này không hỗ trợ phát âm.')
      return
    }

    const synth = window.speechSynthesis
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(syllableSpeechSamples[text] ?? text)
    const voices = synth.getVoices()
    const voice = voices.find((item) => item.lang.toLowerCase() === 'zh-tw')
      ?? voices.find((item) => /^(zh|cmn)(-|$)/i.test(item.lang))
    utterance.voice = voice ?? null
    utterance.lang = voice?.lang ?? 'zh-TW'
    utterance.rate = 0.78
    utterance.onerror = ({ error }) => {
      if (error === 'canceled' || error === 'interrupted') return
      setAudioError('Không phát được âm mẫu. Hãy kiểm tra giọng đọc tiếng Hoa trên thiết bị rồi thử lại.')
    }
    synth.speak(utterance)
  }

  function answer(choice: string) {
    if (selectedAnswer) return
    setSelectedAnswer(choice)
    if (choice === question.answer) setScore((value) => value + 1)
  }

  function nextQuestion() {
    if (questionIndex === quiz.length - 1) {
      setQuestionIndex(0)
      setScore(0)
    } else {
      setQuestionIndex((index) => index + 1)
    }
    setSelectedAnswer(null)
  }

  function resetPractice() {
    setQuestionIndex(0)
    setSelectedAnswer(null)
    setScore(0)
  }

  return (
    <AppLayout>
      <main className="pronunciation-page">
        <div className="page-container pronunciation-content">
          <section className="pronunciation-hero">
            <div className="pronunciation-hero-copy">
              <span className="pronunciation-eyebrow"><AudioLines size={14} /> PHÁT ÂM · PINYIN</span>
              <h1>Nghe đúng thanh điệu,<br /><em>nói rõ từng âm.</em></h1>
              <p>Làm quen với âm phổ thông Đài Loan qua ví dụ nghe được và bài tập ngắn.</p>
              <button type="button" className="pronunciation-hero-link" onClick={() => setActiveTab('tones')}>Bắt đầu học <ChevronRight size={15} /></button>
            </div>
            <div className="pronunciation-hero-art" aria-hidden="true">
              <span className="pronunciation-orbit orbit-one" /><span className="pronunciation-orbit orbit-two" />
              <div className="pronunciation-sound-card"><small>NGHE · NHẮC LẠI</small><strong>你好</strong><span>nǐ hǎo</span><i><b /><b /><b /><b /><b /><b /><b /></i></div>
              <span className="pronunciation-hero-spark">✳</span>
            </div>
          </section>

          <nav className="pronunciation-jump-nav" role="tablist" aria-label="Nội dung phát âm">
            {pronunciationTabs.map((tab) => <button id={`tab-${tab.id}`} key={tab.id} className={activeTab === tab.id ? 'active' : ''} type="button" role="tab" aria-selected={activeTab === tab.id} aria-controls={`panel-${tab.id}`} onClick={() => setActiveTab(tab.id)}><span>{tab.number}</span>{tab.label}</button>)}
          </nav>

          {audioError && <p role="alert">{audioError}</p>}
          <div className="pronunciation-tab-panel" role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`} key={activeTab}>
          {activeTab === 'tones' && <section className="pronunciation-section" id="tones">
            <div className="tone-overview-chart">
              <div className="tone-overview-heading"><strong>Biểu đồ 5 bậc thanh điệu</strong><small>五度標記法</small></div>
              <div className="tone-overview-plot" role="img" aria-label="Biểu đồ năm bậc đường giọng của bốn thanh điệu">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={toneChartData} margin={{ top: 9, right: 12, bottom: 7, left: 12 }}>
                    <CartesianGrid horizontal vertical={false} stroke="#e8e9e9" />
                    <XAxis dataKey="position" type="number" domain={[0, 8]} hide />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} axisLine={false} tickLine={false} tick={{ fill: '#737b85', fontSize: 10 }} width={24} />
                    <Line type="linear" dataKey="tone1" stroke="#ef4444" strokeWidth={3} dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }} activeDot={false} connectNulls={false} isAnimationActive={false} />
                    <Line type="linear" dataKey="tone2" stroke="#ed6b18" strokeWidth={3} dot={{ r: 3, fill: '#ed6b18', strokeWidth: 0 }} activeDot={false} connectNulls={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="tone3" stroke="#35a36b" strokeWidth={3} dot={{ r: 3, fill: '#35a36b', strokeWidth: 0 }} activeDot={false} connectNulls={false} isAnimationActive={false} />
                    <Line type="linear" dataKey="tone4" stroke="#3287d7" strokeWidth={3} dot={{ r: 3, fill: '#3287d7', strokeWidth: 0 }} activeDot={false} connectNulls={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="tone-overview-legend" aria-label="Chú giải biểu đồ">
                <span className="legend-red"><i />Thanh 1 (55)</span><span className="legend-orange"><i />Thanh 2 (35)</span><span className="legend-green"><i />Thanh 3 (214)</span><span className="legend-blue"><i />Thanh 4 (51)</span>
              </div>
            </div>
            <div className="tone-grid">
              {tones.map((tone) => <article className={`tone-card tone-${tone.color}`} key={tone.number ?? 'neutral'}>
                <div className="tone-card-main">
                  <span className="tone-mark-box"><b>{tone.mark}</b></span>
                  <span className="tone-card-copy"><strong>{tone.label}</strong><small>{tone.chineseLabel}</small></span>
                  <button type="button" className="tone-example-chip" onClick={() => speak(tone.example.split(' ')[0])} aria-label={`Nghe ${tone.example}`}><strong>{tone.example.split(' ')[0]}</strong><small>{tone.example.split(' ')[1]}</small><Volume2 size={15} /></button>
                  <button type="button" className="tone-expand-button" aria-expanded={expandedTone === tone.number} aria-label={`${expandedTone === tone.number ? 'Ẩn' : 'Xem'} giải thích ${tone.label}`} onClick={() => setExpandedTone((current) => current === tone.number ? undefined : tone.number)}><ChevronDown className={`tone-expand-icon ${expandedTone === tone.number ? 'expanded' : ''}`} size={17} /></button>
                </div>
                {expandedTone === tone.number && <div className="tone-card-detail"><span>{tone.quality}</span><small>{tone.exampleMeaning}</small></div>}
              </article>)}
            </div>
          </section>}

          {activeTab === 'initials' && <section className="pronunciation-section" id="initials">
            <div className="pronunciation-section-heading"><div><span className="pronunciation-section-kicker">02 · INITIALS</span><h2>Thanh mẫu · 聲母</h2><p>Chọn một âm đầu để xem các vần có thể ghép và nghe từng âm tiết.</p></div><span className="pronunciation-section-mark">21 ÂM</span></div>
            <div className="phoneme-groups">{initials.map((group) => <article className="phoneme-group" key={group.group}><h3>{group.group}</h3><div className="phoneme-chips">{group.symbols.map(([symbol, example]) => <button type="button" className={`phoneme-chip ${selectedInitial === symbol ? 'selected' : ''}`} key={symbol} aria-pressed={selectedInitial === symbol} onClick={() => setSelectedInitial(symbol)}><strong>{symbol}</strong><small>{example}</small><ChevronRight size={13} /></button>)}</div></article>)}</div>
            <article className="initial-combination-panel" aria-live="polite">
              <div className="initial-combination-heading"><div><span className="pronunciation-section-kicker">GHÉP THANH MẪU + VẬN MẪU</span><h3>Âm tiết bắt đầu bằng <b>{selectedInitial}</b></h3></div><span>{selectedInitialSyllables.length} vần</span></div>
              <p>Bấm vào từng âm tiết để nghe cách đọc mẫu.</p>
              <div className="initial-syllable-list">{selectedInitialSyllables.map((syllable) => <button type="button" className="initial-syllable-chip" key={syllable} onClick={() => speak(syllable)} aria-label={`Nghe âm tiết ${syllable}`}><strong>{syllable}</strong><Volume2 size={14} /></button>)}</div>
            </article>
            <p className="pronunciation-footnote"><b>Ghi nhớ:</b> b, d, g là âm tắc không bật hơi; p, t, k bật hơi rõ. Pinyin chuẩn có 21 thanh mẫu; y và w thường dùng để ghi âm đầu trong chính tả.</p>
          </section>}

          {activeTab === 'finals' && <section className="pronunciation-section" id="finals">
            <div className="pronunciation-section-heading"><div><span className="pronunciation-section-kicker">03 · FINALS</span><h2>Vận mẫu · 韻母</h2><p>Phần nguyên âm đứng sau thanh mẫu, hoặc tự tạo thành âm tiết.</p></div><span className="pronunciation-section-mark">韻母</span></div>
            <div className="final-groups">
              {finals.map((group) => (
                <article className="final-group" key={group.group}>
                  <h3>{group.group}</h3>
                  <div className="final-chips">
                    {group.symbols.map(([symbol, example]) => (
                      <button type="button" key={symbol} className="phoneme-chip" aria-pressed={selectedFinal === symbol} onClick={() => setSelectedFinal(symbol)}>
                        <strong>{symbol}</strong><small>{example}</small><ChevronRight size={13} />
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            <article className="initial-combination-panel">
              <div className="initial-combination-heading" aria-live="polite">
                <h3>Âm tiết có vần <b>{selectedFinal}</b></h3>
                <span>{selectedFinalSyllables.length} âm tiết</span>
              </div>
              <p>Bấm vào từng âm tiết để nghe cách đọc mẫu.</p>
              <div className="initial-syllable-list">
                {selectedFinalSyllables.map((syllable) => (
                  <button type="button" className="initial-syllable-chip" key={syllable} onClick={() => speak(syllable)} aria-label={`Nghe âm tiết ${syllable}`}>
                    <strong>{syllable}</strong><Volume2 size={14} />
                  </button>
                ))}
              </div>
            </article>
            <div className="pronunciation-tip"><Waves size={17} /><p><strong>Chú ý âm ü:</strong> sau j, q, x và y, hai chấm được lược bỏ: ju, qu, xu, yu vẫn đọc với âm <b>ü</b>.</p></div>
          </section>}

          {activeTab === 'pinyin-chart' && <section className="pronunciation-section" id="pinyin-chart">
            <div className="pronunciation-section-heading"><div><span className="pronunciation-section-kicker">04 · SYLLABLE TABLE</span><h2>Bảng âm tiết Pinyin</h2><p>Chọn một âm tiết để nghe phát âm mẫu bằng giọng đọc của thiết bị.</p></div><span className="pronunciation-section-mark">拼音表</span></div>
            <div className="pinyin-chart">
              <div className="pinyin-matrix-scroll" role="region" aria-label="Bảng ghép thanh mẫu và vận mẫu, có thể cuộn ngang" tabIndex={0}>
                <table className="pinyin-matrix" aria-label="Bảng âm tiết Pinyin">
                  <thead>
                    <tr>
                      <th scope="col" className="pinyin-matrix-corner">
                        <span>Vận mẫu <span aria-hidden="true">→</span></span>
                        <span>Thanh mẫu <span aria-hidden="true">↓</span></span>
                      </th>
                      {pinyinColumns.map((final) => <th scope="col" key={final}>{final}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {pinyinMatrix.map(({ initial, byFinal }) => (
                      <tr key={initial}>
                        <th scope="row">{initial}</th>
                        {pinyinColumns.map((final) => {
                          const syllable = byFinal.get(final)
                          return (
                            <td key={final}>
                              {syllable && <button type="button" onClick={() => speak(syllable)} aria-label={`Nghe ${syllable}`}>{syllable}</button>}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="pronunciation-footnote">Bảng liệt kê những âm tiết Pinyin thông dụng; một số tổ hợp phụ âm và vận mẫu không tạo thành âm tiết hợp lệ.</p>
          </section>}

          {activeTab === 'practice' && <section className="practice-section" id="practice">
            <div className="practice-copy"><span className="pronunciation-section-kicker">05 · QUICK PRACTICE</span><h2>Luyện nghe và nhận diện Pinyin</h2><p>Nghe từ tiếng Hoa, sau đó chọn cách ghi Pinyin đúng dấu thanh.</p><div className="practice-score"><span>ĐIỂM CỦA BẠN</span><strong>{score}<small> / {questionIndex + (selectedAnswer ? 1 : 0)}</small></strong></div><button className="practice-reset" type="button" onClick={resetPractice}><RotateCcw size={14} /> Làm lại từ đầu</button></div>
            <div className="practice-card">
              <div className="practice-card-top"><span><CircleHelp size={15} /> CÂU {String(questionIndex + 1).padStart(2, '0')}</span><span>{questionIndex + 1} / {quiz.length}</span></div>
              <div className="practice-prompt"><button type="button" onClick={() => speak(question.hanzi)} aria-label={`Nghe từ ${question.hanzi}`}><Volume2 size={17} /></button><strong>{question.hanzi}</strong><span>{question.meaning}</span></div>
              <p className="practice-instruction">Chọn phiên âm Pinyin đúng:</p>
              <div className="practice-choices">{question.choices.map((choice) => {
                const isSelected = selectedAnswer === choice
                const isCorrect = selectedAnswer !== null && choice === question.answer
                return <button key={choice} className={`${isSelected ? 'chosen' : ''} ${isCorrect ? 'correct' : ''} ${isSelected && !answeredCorrectly ? 'incorrect' : ''}`} type="button" disabled={Boolean(selectedAnswer)} onClick={() => answer(choice)}>{choice}{isCorrect && <Check size={15} />}</button>
              })}</div>
              {selectedAnswer && <div className={`practice-feedback ${answeredCorrectly ? 'good' : 'try-again'}`}>{answeredCorrectly ? 'Chính xác! Bạn nghe rất tốt.' : `Chưa đúng — đáp án là ${question.answer}.`}</div>}
              <button className="practice-next" type="button" onClick={nextQuestion} disabled={!selectedAnswer}>{questionIndex === quiz.length - 1 ? 'Làm lại vòng này' : 'Câu tiếp theo'} <ChevronRight size={15} /></button>
            </div>
          </section>}
          </div>
          <p className="pronunciation-disclaimer">Âm thanh được tạo bằng Web Speech API; chất giọng và độ tự nhiên tùy thuộc giọng tiếng Hoa đã cài trên trình duyệt hoặc thiết bị.</p>
        </div>
      </main>
    </AppLayout>
  )
}

export default PronunciationPage
