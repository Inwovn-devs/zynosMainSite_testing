import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, Tag, Switch, Upload, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, PictureOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import { auth } from '../../firebase';
import api from '../../utils/api';
import { formatPrice } from '../../utils/helpers';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, data: null });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [fileList, setFileList] = useState([]);   // new files to upload
  const [existingImages, setExistingImages] = useState([]); // already saved URLs
  const [form] = Form.useForm();

  const fetchProducts = () => {
    setLoading(true);
    api.get(`/products?limit=50&isActive=all${search ? `&search=${search}` : ''}`)
      .then((res) => setProducts(res.data.products || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [search]);
  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/brands')]).then(([c, b]) => {
      setCategories(c.data.categories || []);
      setBrands(b.data.brands || []);
    });
  }, []);

  const handleOpen = (data = null) => {
    setFileList([]);
    setExistingImages(data?.images || []);
    setModal({ open: true, data });
    if (data) {
      form.setFieldsValue({
        name: data.name,
        description: data.description,
        price: data.price,
        discountPrice: data.discountPrice || '',
        category: data.category?._id,
        brand: data.brand?._id,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
      });
    } else {
      form.resetFields();
    }
  };

  const handleBeforeUpload = (file) => {
    setFileList((prev) => [...prev, file]);
    return false; // prevent auto-upload
  };

  const handleRemoveNew = (file) => {
    setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  const handleRemoveExisting = (url) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const fd = new FormData();

      // Append text fields
      fd.append('name', values.name);
      if (values.description) fd.append('description', values.description);
      fd.append('price', values.price);
      if (values.discountPrice) fd.append('discountPrice', values.discountPrice);
      fd.append('category', values.category);
      if (values.brand) fd.append('brand', values.brand);
      fd.append('isFeatured', values.isFeatured || false);
      fd.append('isActive', values.isActive !== undefined ? values.isActive : true);

      // Append existing image URLs so backend keeps them
      existingImages.forEach((url) => fd.append('existingImages', url));

      // Append new image files
      fileList.forEach((file) => fd.append('images', file));

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };

      if (modal.data) {
        await api.put(`/products/${modal.data._id}`, fd, config);
        toast.success('Product updated');
      } else {
        await api.post('/products', fd, config);
        toast.success('Product created');
      }
      setModal({ open: false, data: null });
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    {
      title: 'Product', key: 'product', render: (_, r) => (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {r.images?.[0]
            ? <Image src={r.images[0]} width={52} height={52} style={{ objectFit: 'cover', borderRadius: 8 }} />
            : <div style={{ width: 52, height: 52, background: '#1a1a1a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PictureOutlined style={{ color: '#444' }} />
              </div>
          }
          <div>
            <div style={{ color: '#fff', fontWeight: 600 }}>{r.name}</div>
            <div style={{ color: '#555', fontSize: 12 }}>{r.brand?.name}</div>
          </div>
        </div>
      ),
    },
    { title: 'Category', dataIndex: ['category', 'name'], render: (v) => <span style={{ color: '#aaa' }}>{v}</span> },
    { title: 'Price', dataIndex: 'price', render: (v) => <span style={{ color: '#fff' }}>{formatPrice(v)}</span> },
    { title: 'Stock', dataIndex: 'totalStock', render: (v) => <span style={{ color: v < 10 ? '#e63946' : '#4ade80' }}>{v ?? 0}</span> },
    { title: 'Status', dataIndex: 'isActive', render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag> },
    {
      title: 'Actions', key: 'actions', render: (_, r) => (
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
        <h2 style={{ color: '#fff', fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, letterSpacing: 2, margin: 0 }}>PRODUCTS</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <Input.Search placeholder="Search products..." onSearch={setSearch} style={{ width: 240 }} />
          <Button icon={<PlusOutlined />} onClick={() => handleOpen()} style={{ background: '#e63946', border: 'none', color: '#fff', fontWeight: 600 }}>
            Add Product
          </Button>
        </div>
      </div>

      <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24 }}>
        <Table dataSource={products} columns={columns} rowKey="_id" loading={loading} />
      </div>

      <Modal
        open={modal.open}
        title={<span style={{ color: '#fff' }}>{modal.data ? 'Edit Product' : 'New Product'}</span>}
        onCancel={() => setModal({ open: false, data: null })}
        footer={null}
        width={740}
        styles={{ content: { background: '#111', border: '1px solid #2a2a2a' }, header: { background: '#111' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item name="name" label={<span style={{ color: '#aaa' }}>Product Name</span>} rules={[{ required: true }]}>
            <Input style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
          </Form.Item>

          <Form.Item name="description" label={<span style={{ color: '#aaa' }}>Description</span>}>
            <Input.TextArea rows={3} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="price" label={<span style={{ color: '#aaa' }}>Price (₹)</span>} rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
            </Form.Item>
            <Form.Item name="discountPrice" label={<span style={{ color: '#aaa' }}>Discount Price</span>} style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="category" label={<span style={{ color: '#aaa' }}>Category</span>} rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select placeholder="Select category">
                {categories.map((c) => <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="brand" label={<span style={{ color: '#aaa' }}>Brand</span>} style={{ flex: 1 }}>
              <Select placeholder="Select brand" allowClear>
                {brands.map((b) => <Select.Option key={b._id} value={b._id}>{b.name}</Select.Option>)}
              </Select>
            </Form.Item>
          </div>

          {/* Product Images */}
          <Form.Item label={<span style={{ color: '#aaa' }}>Product Images (up to 10)</span>}>
            {/* Existing images */}
            {existingImages.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {existingImages.map((url) => (
                  <div key={url} style={{ position: 'relative', width: 80, height: 80 }}>
                    <img src={url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #2a2a2a' }} />
                    <button
                      type="button"
                      onClick={() => handleRemoveExisting(url)}
                      style={{
                        position: 'absolute', top: -6, right: -6,
                        width: 20, height: 20, borderRadius: '50%',
                        background: '#e63946', border: 'none', color: '#fff',
                        cursor: 'pointer', fontSize: 12, lineHeight: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload new images */}
            <Upload
              accept="image/*"
              multiple
              showUploadList={true}
              fileList={fileList.map((f, i) => ({ uid: f.uid || String(i), name: f.name, status: 'done', originFileObj: f }))}
              beforeUpload={handleBeforeUpload}
              onRemove={handleRemoveNew}
              listType="picture"
            >
              <Button icon={<UploadOutlined />} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#aaa' }}>
                Add Images
              </Button>
            </Upload>
            <p style={{ color: '#555', fontSize: 12, marginTop: 6 }}>
              {existingImages.length + fileList.length} / 10 images
            </p>
          </Form.Item>

          <div style={{ display: 'flex', gap: 24 }}>
            <Form.Item name="isFeatured" label={<span style={{ color: '#aaa' }}>Featured</span>} valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="isActive" label={<span style={{ color: '#aaa' }}>Active</span>} valuePropName="checked" initialValue={true}>
              <Switch defaultChecked />
            </Form.Item>
          </div>

          <Button
            htmlType="submit"
            loading={saving}
            style={{ background: '#e63946', border: 'none', color: '#fff', width: '100%', height: 44, fontWeight: 700 }}
          >
            {saving ? 'Uploading to Cloudinary...' : modal.data ? 'Update Product' : 'Create Product'}
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
