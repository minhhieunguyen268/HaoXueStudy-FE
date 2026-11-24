import AppLayout from '../../shared/components/AppLayout'

export default function ProgressStatus({ error, retry }: { error: string; retry: () => void }) {
  return <AppLayout><main><div className="page-container" role="status">
    {error || 'Đang tải tiến độ học…'} {error && <button type="button" onClick={retry}>Thử lại</button>}
  </div></main></AppLayout>
}
