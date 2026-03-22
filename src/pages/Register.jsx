import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Divider } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, GoogleOutlined } from '@ant-design/icons';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import toast from 'react-hot-toast';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async ({ name, email, password }) => {
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.message.replace('Firebase: ', '').replace(/\(.*\)/, '').trim());
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch {
      toast.error('Google sign-up failed');
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
          <h2 style={{ color: '#fff', marginTop: 16, marginBottom: 4 }}>Create Account</h2>
          <p style={{ color: '#666', fontSize: 14 }}>Join the ZYNOS community</p>
        </div>

        <Form layout="vertical" onFinish={handleRegister} requiredMark={false}>
          <Form.Item name="name" rules={[{ required: true, message: 'Name required' }]}>
            <Input
              prefix={<UserOutlined style={{ color: '#555' }} />}
              placeholder="Full name"
              size="large"
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
            />
          </Form.Item>

          <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
            <Input
              prefix={<MailOutlined style={{ color: '#555' }} />}
              placeholder="Email address"
              size="large"
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
            />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, min: 6, message: 'Min 6 characters' }]}>
            <Input.Password
              prefix={<LockOutlined style={{ color: '#555' }} />}
              placeholder="Password (min 6 chars)"
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
            CREATE ACCOUNT
          </Button>
        </Form>

        <Divider style={{ borderColor: '#2a2a2a', color: '#555' }}>or</Divider>

        <Button
          block
          size="large"
          onClick={handleGoogle}
          icon={<GoogleOutlined />}
          style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#fff', height: 48, fontWeight: 600 }}
        >
          Continue with Google
        </Button>

        <p style={{ textAlign: 'center', marginTop: 24, color: '#666', fontSize: 14 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#e63946', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
