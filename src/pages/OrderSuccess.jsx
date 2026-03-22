import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Result, Button, Spin } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import api from '../utils/api';
import { formatPrice, formatDate } from '../utils/helpers';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${orderId}`).then((res) => setOrder(res.data.order)).finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div style={{ padding: 80, textAlign: 'center' }}><Spin /></div>;

  return (
    <div style={{ maxWidth: 640, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
      <CheckCircleFilled style={{ fontSize: 72, color: '#4ade80', marginBottom: 24 }} />
      <h1 style={{ color: '#fff', fontFamily: 'Bebas Neue, sans-serif', fontSize: 48, letterSpacing: 2, marginBottom: 8 }}>
        ORDER PLACED!
      </h1>
      <p style={{ color: '#666', fontSize: 16, marginBottom: 32 }}>
        Thank you for your purchase. Your order has been confirmed.
      </p>

      {order && (
        <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24, marginBottom: 32, textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ color: '#666' }}>Order #</span>
            <strong style={{ color: '#fff' }}>{order.orderNumber}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ color: '#666' }}>Date</span>
            <span style={{ color: '#aaa' }}>{formatDate(order.createdAt)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ color: '#666' }}>Total</span>
            <strong style={{ color: '#e63946', fontSize: 18 }}>{formatPrice(order.total)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#666' }}>Status</span>
            <span style={{ color: '#4ade80', fontWeight: 600 }}>Confirmed</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <Link to={`/orders/${orderId}`}>
          <Button style={{ background: '#e63946', border: 'none', color: '#fff', height: 44, fontWeight: 600, paddingInline: 24 }}>
            Track Order
          </Button>
        </Link>
        <Link to="/products">
          <Button style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#aaa', height: 44 }}>
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
