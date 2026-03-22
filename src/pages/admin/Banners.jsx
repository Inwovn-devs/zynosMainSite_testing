import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Switch, Tag, Upload, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, PictureOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import { auth } from '../../firebase';
import api from '../../utils/api';

// Build FormData from form values + file
const buildFormData = (values, file) => {
  const fd = new FormData();
  Object.entries(values).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  if (file) fd.append('image', file);
  return fd;
};

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, data: null });
  const [saving, setSaving] = useState(false);
  const [fileObj, setFileObj] = useState(null);     // raw File object
  const [previewUrl, setPreviewUrl] = useState(''); // local preview
  const [form] = Form.useForm();

  const fetch = () => {
    setLoading(true);
    api.get('/banners/all').then((r) => setBanners(r.data.banners || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleOpen = (data = null) => {
    setFileObj(null);
    setPreviewUrl(data?.image || '');
    setModal({ open: true, data });
    if (data) form.setFieldsValue({ title: data.title, link: data.link, order: data.order, isActive: data.isActive });
    else form.resetFields();
  };

  const handleBeforeUpload = (file) => {
    setFileObj(file);
    setPreviewUrl(URL.createObjectURL(file));
    return false; // prevent auto-upload
  };

  const handleSave = async (values) => {
    if (!modal.data && !fileObj) {
      toast.error('Please select a banner image');
      return;
    }
    setSaving(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const fd = buildFormData(values, fileObj);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };

      if (modal.data) {
        await api.put(`/banners/${modal.data._id}`, fd, config);
        toast.success('Banner updated');
      } else {
        await api.post('/banners', fd, config);
        toast.success('Banner created');
      }
      setModal({ open: false, data: null });
      fetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/banners/${id}`);
      setBanners((p) => p.filter((b) => b._id !== id));
      toast.success('Deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    {
      title: 'Banner', key: 'banner', render: (_, r) => (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {r.image
            ? <Image src={r.image} width={100} height={50} style={{ objectFit: 'cover', borderRadius: 6 }} />
            : <div style={{ width: 100, height: 50, background: '#1a1a1a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PictureOutlined style={{ color: '#444' }} />
              </div>
          }
          <strong style={{ color: '#fff' }}>{r.title}</strong>
        </div>
      ),
    },
    { title: 'Order', dataIndex: 'order', render: (v) => <span style={{ color: '#aaa' }}>{v}</span> },
    { title: 'Status', dataIndex: 'isActive', render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag> },
    {
      title: 'Actions', render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleOpen(r)} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#aaa' }} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(r._id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ color: '#fff', fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, letterSpacing: 2, margin: 0 }}>BANNERS</h2>
        <Button icon={<PlusOutlined />} onClick={() => handleOpen()} style={{ background: '#e63946', border: 'none', color: '#fff', fontWeight: 600 }}>
          Add Banner
        </Button>
      </div>

      <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24 }}>
        <Table dataSource={banners} columns={columns} rowKey="_id" loading={loading} />
      </div>

      <Modal
        open={modal.open}
        title={<span style={{ color: '#fff' }}>{modal.data ? 'Edit' : 'New'} Banner</span>}
        onCancel={() => setModal({ open: false, data: null })}
        footer={null}
        styles={{ content: { background: '#111', border: '1px solid #2a2a2a' }, header: { background: '#111' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item name="title" label={<span style={{ color: '#aaa' }}>Title</span>} rules={[{ required: true }]}>
            <Input style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
          </Form.Item>

          {/* Image Upload */}
          <Form.Item label={<span style={{ color: '#aaa' }}>Banner Image {modal.data ? '(leave empty to keep current)' : '*'}</span>}>
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleBeforeUpload}
            >
              <Button icon={<UploadOutlined />} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#aaa' }}>
                Select Image
              </Button>
            </Upload>

            {previewUrl && (
              <div style={{ marginTop: 12 }}>
                <img
                  src={previewUrl}
                  alt="preview"
                  style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8, border: '1px solid #2a2a2a' }}
                />
                {fileObj && (
                  <p style={{ color: '#4ade80', fontSize: 12, marginTop: 6 }}>
                    ✓ {fileObj.name} ({(fileObj.size / 1024).toFixed(0)} KB)
                  </p>
                )}
              </div>
            )}
          </Form.Item>

          <Form.Item name="link" label={<span style={{ color: '#aaa' }}>Link (optional)</span>}>
            <Input placeholder="/products" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
          </Form.Item>

          <Form.Item name="order" label={<span style={{ color: '#aaa' }}>Display Order</span>} initialValue={0}>
            <InputNumber min={0} style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
          </Form.Item>

          <Form.Item name="isActive" label={<span style={{ color: '#aaa' }}>Active</span>} valuePropName="checked" initialValue={true}>
            <Switch defaultChecked />
          </Form.Item>

          <Button
            htmlType="submit"
            loading={saving}
            style={{ background: '#e63946', border: 'none', color: '#fff', width: '100%', height: 44, fontWeight: 700 }}
          >
            {saving ? 'Uploading to Cloudinary...' : modal.data ? 'Update Banner' : 'Create Banner'}
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
