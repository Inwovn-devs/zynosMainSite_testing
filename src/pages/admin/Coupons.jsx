import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, DatePicker, Space, Tag, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { formatPrice, formatDate } from '../../utils/helpers';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, data: null });
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetch = () => {
    setLoading(true);
    api.get('/coupons').then((r) => setCoupons(r.data.coupons || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleOpen = (data = null) => {
    setModal({ open: true, data });
    if (data) form.setFieldsValue({ ...data, expiresAt: data.expiresAt ? dayjs(data.expiresAt) : null });
    else form.resetFields();
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const payload = { ...values, expiresAt: values.expiresAt?.toISOString() };
      if (modal.data) { await api.put(`/coupons/${modal.data._id}`, payload); toast.success('Updated'); }
      else { await api.post('/coupons', payload); toast.success('Created'); }
      setModal({ open: false, data: null });
      fetch();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/coupons/${id}`); setCoupons((p) => p.filter((c) => c._id !== id)); toast.success('Deleted'); }
    catch (err) { toast.error(err.message); }
  };

  const columns = [
    { title: 'Code', dataIndex: 'code', render: (v) => <strong style={{ color: '#e63946', fontFamily: 'monospace', letterSpacing: 2 }}>{v}</strong> },
    {
      title: 'Discount', key: 'discount', render: (_, r) => (
        <span style={{ color: '#fff' }}>
          {r.discountType === 'percentage' ? `${r.discountValue}%` : formatPrice(r.discountValue)}
        </span>
      )
    },
    { title: 'Min Order', dataIndex: 'minOrderValue', render: (v) => <span style={{ color: '#aaa' }}>{v ? formatPrice(v) : '-'}</span> },
    { title: 'Used', key: 'usage', render: (_, r) => <span style={{ color: '#aaa' }}>{r.usedCount}/{r.usageLimit || '∞'}</span> },
    { title: 'Expires', dataIndex: 'expiresAt', render: (v) => <span style={{ color: '#666', fontSize: 13 }}>{v ? formatDate(v) : 'Never'}</span> },
    { title: 'Status', dataIndex: 'isActive', render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag> },
    {
      title: 'Actions', render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleOpen(r)} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#aaa' }} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(r._id)} />
        </Space>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ color: '#fff', fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, letterSpacing: 2, margin: 0 }}>COUPONS</h2>
        <Button icon={<PlusOutlined />} onClick={() => handleOpen()} style={{ background: '#e63946', border: 'none', color: '#fff', fontWeight: 600 }}>Add Coupon</Button>
      </div>
      <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24 }}>
        <Table dataSource={coupons} columns={columns} rowKey="_id" loading={loading} />
      </div>

      <Modal open={modal.open} title={<span style={{ color: '#fff' }}>{modal.data ? 'Edit' : 'New'} Coupon</span>}
        onCancel={() => setModal({ open: false, data: null })} footer={null}
        styles={{ content: { background: '#111', border: '1px solid #2a2a2a' }, header: { background: '#111' } }}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item name="code" label={<span style={{ color: '#aaa' }}>Code</span>} rules={[{ required: true }]}
            normalize={(v) => v.toUpperCase()}>
            <Input style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', fontFamily: 'monospace', letterSpacing: 2 }} />
          </Form.Item>
          <div style={{ display: 'flex', gap: 12 }}>
            <Form.Item name="discountType" label={<span style={{ color: '#aaa' }}>Type</span>} rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select options={[{ value: 'percentage', label: 'Percentage' }, { value: 'fixed', label: 'Fixed Amount' }]} />
            </Form.Item>
            <Form.Item name="discountValue" label={<span style={{ color: '#aaa' }}>Value</span>} rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Form.Item name="minOrderValue" label={<span style={{ color: '#aaa' }}>Min Order</span>} style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
            </Form.Item>
            <Form.Item name="usageLimit" label={<span style={{ color: '#aaa' }}>Usage Limit</span>} style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
            </Form.Item>
          </div>
          <Form.Item name="expiresAt" label={<span style={{ color: '#aaa' }}>Expiry Date</span>}>
            <DatePicker style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
          </Form.Item>
          <Form.Item name="isActive" label={<span style={{ color: '#aaa' }}>Active</span>} valuePropName="checked" initialValue={true}>
            <Switch defaultChecked />
          </Form.Item>
          <Button htmlType="submit" loading={saving} style={{ background: '#e63946', border: 'none', color: '#fff', width: '100%', height: 44, fontWeight: 700 }}>Save</Button>
        </Form>
      </Modal>
    </div>
  );
}
