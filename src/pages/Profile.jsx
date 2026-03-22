import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Row, Col, Form, Input, Button, Modal, Tag, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined } from '@ant-design/icons';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useSelector((s) => s.auth);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addrModal, setAddrModal] = useState({ open: false, data: null });
  const [form] = Form.useForm();
  const [addrForm] = Form.useForm();

  useEffect(() => {
    api.get('/addresses').then((res) => setAddresses(res.data.addresses || [])).finally(() => setLoading(false));
    if (user) form.setFieldsValue({ displayName: user.displayName, email: user.email });
  }, [user]);

  const handleSaveProfile = async ({ displayName }) => {
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName });
      await api.put('/auth/profile', { displayName });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddress = async (values) => {
    try {
      if (addrModal.data?._id) {
        const res = await api.put(`/addresses/${addrModal.data._id}`, values);
        setAddresses((prev) => prev.map((a) => a._id === addrModal.data._id ? res.data.address : a));
        toast.success('Address updated');
      } else {
        const res = await api.post('/addresses', values);
        setAddresses((prev) => [...prev, res.data.address]);
        toast.success('Address added');
      }
      setAddrModal({ open: false, data: null });
      addrForm.resetFields();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
      toast.success('Address deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openEdit = (addr) => {
    setAddrModal({ open: true, data: addr });
    addrForm.setFieldsValue(addr);
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 24px' }}>
      <h1 style={{ color: '#fff', fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, letterSpacing: 2, marginBottom: 32 }}>
        MY PROFILE
      </h1>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24 }}>
            <h3 style={{ color: '#fff', marginBottom: 24 }}>Personal Information</h3>
            <Form form={form} layout="vertical" onFinish={handleSaveProfile} requiredMark={false}>
              <Form.Item label={<span style={{ color: '#aaa' }}>Display Name</span>} name="displayName">
                <Input style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
              </Form.Item>
              <Form.Item label={<span style={{ color: '#aaa' }}>Email</span>} name="email">
                <Input disabled style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
              </Form.Item>
              <Button
                htmlType="submit"
                loading={saving}
                style={{ background: '#e63946', border: 'none', color: '#fff', fontWeight: 600 }}
              >
                Save Changes
              </Button>
            </Form>
          </div>
        </Col>

        <Col xs={24} md={12}>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: '#fff', margin: 0 }}>Saved Addresses</h3>
              <Button
                icon={<PlusOutlined />}
                onClick={() => { setAddrModal({ open: true, data: null }); addrForm.resetFields(); }}
                style={{ background: '#e63946', border: 'none', color: '#fff' }}
                size="small"
              >Add</Button>
            </div>

            {loading ? <Spin /> : addresses.length === 0 ? (
              <p style={{ color: '#555' }}>No addresses saved</p>
            ) : (
              addresses.map((addr) => (
                <div key={addr._id} style={{
                  background: '#1a1a1a',
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 12,
                  border: `1px solid ${addr.isDefault ? '#e63946' : '#2a2a2a'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                      <HomeOutlined style={{ color: '#e63946' }} />
                      <strong style={{ color: '#fff', fontSize: 14 }}>{addr.name}</strong>
                      {addr.isDefault && <Tag color="red" style={{ fontSize: 11 }}>Default</Tag>}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <EditOutlined style={{ color: '#aaa', cursor: 'pointer' }} onClick={() => openEdit(addr)} />
                      <DeleteOutlined style={{ color: '#e63946', cursor: 'pointer' }} onClick={() => handleDeleteAddress(addr._id)} />
                    </div>
                  </div>
                  <div style={{ color: '#666', fontSize: 13, lineHeight: 1.6 }}>
                    <div>{addr.phone}</div>
                    <div>{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Col>
      </Row>

      <Modal
        open={addrModal.open}
        title={<span style={{ color: '#fff' }}>{addrModal.data ? 'Edit Address' : 'New Address'}</span>}
        onCancel={() => setAddrModal({ open: false, data: null })}
        footer={null}
        styles={{ content: { background: '#111', border: '1px solid #2a2a2a' }, header: { background: '#111' } }}
      >
        <Form form={addrForm} layout="vertical" onFinish={handleSaveAddress} style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="name" rules={[{ required: true }]}>
                <Input placeholder="Full Name" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" rules={[{ required: true }]}>
                <Input placeholder="Phone" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="addressLine1" rules={[{ required: true }]}>
            <Input placeholder="Address Line 1" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
          </Form.Item>
          <Form.Item name="addressLine2">
            <Input placeholder="Address Line 2 (optional)" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="city" rules={[{ required: true }]}>
                <Input placeholder="City" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="state" rules={[{ required: true }]}>
                <Input placeholder="State" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="pincode" rules={[{ required: true }]}>
                <Input placeholder="PIN Code" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
              </Form.Item>
            </Col>
          </Row>
          <Button htmlType="submit" style={{ background: '#e63946', border: 'none', color: '#fff', width: '100%', height: 44, fontWeight: 700 }}>
            {addrModal.data ? 'Update Address' : 'Save Address'}
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
