import { Spin } from 'antd';

export default function LoadingSpinner({ fullScreen = false }) {
  if (fullScreen) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0a0a0a',
      }}>
        <Spin size="large" />
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
      <Spin size="large" />
    </div>
  );
}
