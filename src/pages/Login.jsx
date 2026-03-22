import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Divider } from 'antd';
import { MailOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import toast from 'react-hot-toast';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message.replace('Firebase: ', '').replace(/\(.*\)/, '').trim());
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Welcome!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error('Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: '#111',
        border: '1px solid #2a2a2a',
        borderRadius: 16,
        padding: 40,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/">
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, color: '#e63946', letterSpacing: 3 }}>ZYNOS</span>
          </Link>
          <h2 style={{ color: '#fff', marginTop: 16, marginBottom: 4 }}>Welcome Back</h2>
          <p style={{ color: '#666', fontSize: 14 }}>Sign in to your account</p>
        </div>

        <Form layout="vertical" onFinish={handleLogin} requiredMark={false}>
          <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
            <Input
              prefix={<MailOutlined style={{ color: '#555' }} />}
              placeholder="Email address"
              size="large"
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
            />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, min: 6 }]}>
            <Input.Password
              prefix={<LockOutlined style={{ color: '#555' }} />}
              placeholder="Password"
              size="large"
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            style={{ background: '#e63946', border: 'none', fontWeight: 700, letterSpacing: 1, height: 48 }}
          >
            SIGN IN
          </Button>
        </Form>

        <Divider style={{ borderColor: '#2a2a2a', color: '#555' }}>or</Divider>

        <Button
          block
          size="large"
          onClick={handleGoogle}
          loading={googleLoading}
          icon={<GoogleOutlined />}
          style={{
            background: 'transparent',
            border: '1px solid #2a2a2a',
            color: '#fff',
            height: 48,
            fontWeight: 600,
          }}
        >
          Continue with Google
        </Button>

        <p style={{ textAlign: 'center', marginTop: 24, color: '#666', fontSize: 14 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#e63946', fontWeight: 600 }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
