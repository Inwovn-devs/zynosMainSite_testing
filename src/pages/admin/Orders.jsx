import { useEffect, useState } from 'react';
import { Table, Button, Select, Tag, Modal, Descriptions } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { formatPrice, formatDate, ORDER_STATUS_COLORS } from '../../utils/helpers';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState(null);

  useEffect(() => {
    api.get('/orders').then((r) => setOrders(r.data.orders || [])).finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, orderStatus: status } : o));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { title: 'Order #', dataIndex: 'orderNumber', render: (v) => <strong style={{ color: '#fff' }}>{v}</strong> },
    {
      title: 'Customer', key: 'user', render: (_, r) => (
        <div>
          <div style={{ color: '#fff' }}>{r.user?.displayName || 'User'}</div>
          <div style={{ color: '#555', fontSize: 12 }}>{r.user?.email}</div>
        </div>
      )
    },
    { title: 'Date', dataIndex: 'createdAt', render: (v) => <span style={{ color: '#666' }}>{formatDate(v)}</span> },
    { title: 'Total', dataIndex: 'total', render: (v) => <strong style={{ color: '#e63946' }}>{formatPrice(v)}</strong> },
    {
      title: 'Status', dataIndex: 'orderStatus', render: (v, r) => (
        <Select
          value={v}
          size="small"
          style={{ width: 130 }}
          onChange={(val) => handleStatusChange(r._id, val)}
          options={ORDER_STATUSES.map((s) => ({ value: s, label: <Tag color={ORDER_STATUS_COLORS[s]} style={{ textTransform: 'capitalize' }}>{s}</Tag> }))}
        />
      )
    },
    {
      title: 'Actions', render: (_, r) => (
        <Button icon={<EyeOutlined />} size="small" onClick={() => setViewOrder(r)} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#aaa' }} />
      )
    },
  ];

  return (
    <div>
      <h2 style={{ color: '#fff', fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, letterSpacing: 2, marginBottom: 24 }}>ORDERS</h2>
      <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24 }}>
        <Table dataSource={orders} columns={columns} rowKey="_id" loading={loading} />
      </div>

      <Modal
        open={!!viewOrder}
        title={<span style={{ color: '#fff' }}>Order #{viewOrder?.orderNumber}</span>}
        onCancel={() => setViewOrder(null)}
        footer={null}
        width={640}
        styles={{ content: { background: '#111', border: '1px solid #2a2a2a' }, header: { background: '#111' } }}
      >
        {viewOrder && (
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 20 }}>
              {viewOrder.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
                  <img src={item.image} alt="" style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{item.name}</div>
                    <div style={{ color: '#555', fontSize: 12 }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ color: '#fff' }}>{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
            <Descriptions column={1} size="small" labelStyle={{ color: '#666' }} contentStyle={{ color: '#fff' }}>
              <Descriptions.Item label="Total">{formatPrice(viewOrder.total)}</Descriptions.Item>
              <Descriptions.Item label="Payment">{viewOrder.paymentStatus}</Descriptions.Item>
              <Descriptions.Item label="Payment ID">{viewOrder.razorpayPaymentId || '-'}</Descriptions.Item>
              <Descriptions.Item label="Tracking">{viewOrder.trackingId || '-'}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}
