import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Tag, Steps, Spin, Empty } from 'antd';
import api from '../utils/api';
import { formatPrice, formatDate, ORDER_STATUS_COLORS } from '../utils/helpers';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${orderId}`).then((res) => setOrder(res.data.order)).finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div style={{ padding: 80, textAlign: 'center' }}><Spin /></div>;
  if (!order) return <Empty description="Order not found" style={{ padding: 80 }} />;

  const currentStep = STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ color: '#fff', fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, letterSpacing: 2, margin: 0 }}>
          ORDER #{order.orderNumber}
        </h1>
        <Tag color={ORDER_STATUS_COLORS[order.orderStatus]} style={{ fontSize: 14, padding: '4px 12px', textTransform: 'capitalize' }}>
          {order.orderStatus}
        </Tag>
      </div>

      {/* Tracking steps */}
      {!['cancelled', 'refunded'].includes(order.orderStatus) && (
        <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 32, marginBottom: 24 }}>
          <h3 style={{ color: '#fff', marginBottom: 24 }}>Order Tracking</h3>
          <Steps
            current={currentStep >= 0 ? currentStep : 0}
            items={STATUS_STEPS.map((s) => ({
              title: <span style={{ color: '#aaa', textTransform: 'capitalize', fontSize: 13 }}>{s}</span>,
            }))}
          />
          {order.trackingId && (
            <p style={{ color: '#666', marginTop: 16, fontSize: 13 }}>Tracking ID: <strong style={{ color: '#fff' }}>{order.trackingId}</strong></p>
          )}
        </div>
      )}

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {/* Items */}
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <h3 style={{ color: '#fff', marginBottom: 20 }}>Items Ordered</h3>
            {order.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'center' }}>
                <img src={item.image} alt={item.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid #2a2a2a' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 600 }}>{item.name}</div>
                  {item.variant && (
                    <div style={{ color: '#555', fontSize: 13 }}>
                      {item.variant.size && `Size: ${item.variant.size}`}
                      {item.variant.color && ` · Color: ${item.variant.color}`}
                    </div>
                  )}
                  <div style={{ color: '#666', fontSize: 13 }}>Qty: {item.quantity}</div>
                </div>
                <div style={{ color: '#fff', fontWeight: 700 }}>{formatPrice(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>

          {/* Address */}
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24 }}>
            <h3 style={{ color: '#fff', marginBottom: 16 }}>Delivery Address</h3>
            {order.shippingAddress && (
              <div style={{ color: '#aaa', lineHeight: 1.8 }}>
                <div><strong style={{ color: '#fff' }}>{order.shippingAddress.name}</strong> · {order.shippingAddress.phone}</div>
                <div>{order.shippingAddress.addressLine1}</div>
                <div>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</div>
              </div>
            )}
          </div>
        </Col>

        <Col xs={24} lg={8}>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24 }}>
            <h3 style={{ color: '#fff', marginBottom: 16 }}>Payment Summary</h3>
            <div style={{ color: '#555', fontSize: 13, marginBottom: 4 }}>Placed: {formatDate(order.createdAt)}</div>
            <div style={{ color: '#555', fontSize: 13, marginBottom: 16 }}>Payment: {order.paymentStatus}</div>

            {[
              ['Subtotal', formatPrice(order.subtotal)],
              ['Shipping', order.shippingCharge === 0 ? 'FREE' : formatPrice(order.shippingCharge)],
              ...(order.discount > 0 ? [['Discount', `-${formatPrice(order.discount)}`]] : []),
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: 10, fontSize: 14 }}>
                <span>{label}</span>
                <span>{val}</span>
              </div>
            ))}

            <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: 16, marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#fff', fontWeight: 700 }}>Total</span>
              <span style={{ color: '#e63946', fontWeight: 800, fontSize: 18 }}>{formatPrice(order.total)}</span>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}
