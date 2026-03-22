import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Tag, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, data: null });
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetch = () => {
    setLoading(true);
    api.get('/brands').then((r) => setBrands(r.data.brands || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleOpen = (data = null) => {
    setModal({ open: true, data });
    if (data) form.setFieldsValue(data); else form.resetFields();
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      if (modal.data) { await api.put(`/brands/${modal.data._id}`, values); toast.success('Updated'); }
      else { await api.post('/brands', values); toast.success('Created'); }
      setModal({ open: false, data: null });
      fetch();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/brands/${id}`); setBrands((p) => p.filter((b) => b._id !== id)); toast.success('Deleted'); }
    catch (err) { toast.error(err.message); }
  };

  const columns = [
    {
      title: 'Brand', key: 'brand', render: (_, r) => (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {r.logo && <img src={r.logo} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'contain', background: '#1a1a1a', padding: 2 }} />}
          <strong style={{ color: '#fff' }}>{r.name}</strong>
        </div>
      )
    },
    { title: 'Slug', dataIndex: 'slug', render: (v) => <span style={{ color: '#555' }}>{v}</span> },
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
        <h2 style={{ color: '#fff', fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, letterSpacing: 2, margin: 0 }}>BRANDS</h2>
        <Button icon={<PlusOutlined />} onClick={() => handleOpen()} style={{ background: '#e63946', border: 'none', color: '#fff', fontWeight: 600 }}>Add Brand</Button>
      </div>
      <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24 }}>
        <Table dataSource={brands} columns={columns} rowKey="_id" loading={loading} />
      </div>
      <Modal open={modal.open} title={<span style={{ color: '#fff' }}>{modal.data ? 'Edit' : 'New'} Brand</span>}
        onCancel={() => setModal({ open: false, data: null })} footer={null}
        styles={{ content: { background: '#111', border: '1px solid #2a2a2a' }, header: { background: '#111' } }}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item name="name" label={<span style={{ color: '#aaa' }}>Name</span>} rules={[{ required: true }]}>
            <Input style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
          </Form.Item>
          <Form.Item name="logo" label={<span style={{ color: '#aaa' }}>Logo URL</span>}>
            <Input placeholder="https://..." style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
          </Form.Item>
          <Form.Item name="description" label={<span style={{ color: '#aaa' }}>Description</span>}>
            <Input.TextArea rows={2} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
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
