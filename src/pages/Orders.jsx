import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Empty, Spin } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import api from '../utils/api';
import { formatPrice, formatDate, ORDER_STATUS_COLORS } from '../utils/helpers';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my').then((res) => setOrders(res.data.orders || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 80, textAlign: 'center' }}><Spin /></div>;

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 24px' }}>
      <h1 style={{ color: '#fff', fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, letterSpacing: 2, marginBottom: 32 }}>
        MY ORDERS
      </h1>

      {orders.length === 0 ? (
        <Empty
          image={<ShoppingOutlined style={{ fontSize: 64, color: '#333' }} />}
          description={<span style={{ color: '#555' }}>No orders yet</span>}
        />
      ) : (
        orders.map((order) => (
          <Link key={order._id} to={`/orders/${order._id}`} style={{ display: 'block', marginBottom: 16 }}>
            <div style={{
              background: '#111',
              border: '1px solid #2a2a2a',
              borderRadius: 12,
              padding: 20,
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#e63946'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700 }}>Order #{order.orderNumber}</div>
                  <div style={{ color: '#555', fontSize: 13 }}>{formatDate(order.createdAt)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Tag color={ORDER_STATUS_COLORS[order.orderStatus]} style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                    {order.orderStatus}
                  </Tag>
                  <div style={{ color: '#e63946', fontWeight: 700, fontSize: 16, marginTop: 4 }}>{formatPrice(order.total)}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {order.items?.slice(0, 4).map((item, i) => (
                  <img
                    key={i}
                    src={item.image || 'https://via.placeholder.com/56'}
                    alt={item.name}
                    style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, border: '1px solid #2a2a2a' }}
                  />
                ))}
                {order.items?.length > 4 && (
                  <div style={{
                    width: 56, height: 56, borderRadius: 6, background: '#1a1a1a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#666', fontSize: 13, border: '1px solid #2a2a2a',
                  }}>+{order.items.length - 4}</div>
                )}
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
