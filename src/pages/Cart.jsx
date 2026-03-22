import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Input, Button, Empty, Tag } from 'antd';
import { DeleteOutlined, MinusOutlined, PlusOutlined, ShoppingOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import { updateCartItem, removeFromCart } from '../store/slices/cartSlice';
import { formatPrice } from '../utils/helpers';
import api from '../utils/api';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((s) => s.cart);
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.discountPrice || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const discount = couponData
    ? couponData.discountType === 'percentage'
      ? Math.min(subtotal * (couponData.discountValue / 100), couponData.maxDiscount || Infinity)
      : couponData.discountValue
    : 0;
  const total = subtotal + shipping - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const res = await api.post('/coupons/validate', { code: couponCode, orderTotal: subtotal });
      setCouponData(res.data.coupon);
      toast.success(`Coupon applied! You save ${formatPrice(discount)}`);
    } catch (err) {
      setCouponData(null);
      toast.error(err.message);
    } finally {
      setApplyingCoupon(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <Empty
          image={<ShoppingOutlined style={{ fontSize: 64, color: '#333' }} />}
          description={<span style={{ color: '#555' }}>Your cart is empty</span>}
        />
        <Link to="/products">
          <Button style={{ background: '#e63946', border: 'none', color: '#fff', marginTop: 24, height: 44, fontWeight: 600 }}>
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1280, margin: '40px auto', padding: '0 24px' }}>
      <h1 style={{ color: '#fff', fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, letterSpacing: 2, marginBottom: 32 }}>
        YOUR CART
      </h1>

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={16}>
          {items.map((item) => {
            const price = item.product?.discountPrice || item.product?.price || 0;
            return (
              <div key={`${item.product?._id}-${JSON.stringify(item.variant)}`} style={{
                display: 'flex',
                gap: 16,
                background: '#111',
                border: '1px solid #2a2a2a',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                alignItems: 'center',
              }}>
                <img
                  src={item.product?.images?.[0] || 'https://via.placeholder.com/100'}
                  alt={item.product?.name}
                  style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link to={`/products/${item.product?.slug}`}>
                    <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{item.product?.name}</h3>
                  </Link>
                  {item.variant && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      {item.variant.size && <Tag color="#2a2a2a" style={{ color: '#aaa' }}>Size: {item.variant.size}</Tag>}
                      {item.variant.color && <Tag color="#2a2a2a" style={{ color: '#aaa' }}>Color: {item.variant.color}</Tag>}
                    </div>
                  )}
                  <div style={{ color: '#e63946', fontWeight: 700, fontSize: 16 }}>{formatPrice(price)}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid #2a2a2a', borderRadius: 8, overflow: 'hidden' }}>
                    <button
                      onClick={() => dispatch(updateCartItem({ productId: item.product._id, quantity: item.quantity - 1, variant: item.variant }))}
                      style={{ background: '#1a1a1a', border: 'none', color: '#fff', padding: '8px 12px', cursor: 'pointer' }}
                      disabled={item.quantity <= 1}
                    ><MinusOutlined /></button>
                    <span style={{ color: '#fff', padding: '8px 14px', background: '#111', fontWeight: 600 }}>{item.quantity}</span>
                    <button
                      onClick={() => dispatch(updateCartItem({ productId: item.product._id, quantity: item.quantity + 1, variant: item.variant }))}
                      style={{ background: '#1a1a1a', border: 'none', color: '#fff', padding: '8px 12px', cursor: 'pointer' }}
                    ><PlusOutlined /></button>
                  </div>

                  <div style={{ color: '#fff', fontWeight: 700, minWidth: 80, textAlign: 'right' }}>
                    {formatPrice(price * item.quantity)}
                  </div>

                  <button
                    onClick={() => dispatch(removeFromCart({ productId: item.product._id, variant: item.variant }))}
                    style={{ background: 'none', border: 'none', color: '#e63946', cursor: 'pointer', padding: 8 }}
                  ><DeleteOutlined style={{ fontSize: 18 }} /></button>
                </div>
              </div>
            );
          })}
        </Col>

        <Col xs={24} lg={8}>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24, position: 'sticky', top: 80 }}>
            <h3 style={{ color: '#fff', marginBottom: 24 }}>Order Summary</h3>

            {[['Subtotal', formatPrice(subtotal)], ['Shipping', shipping === 0 ? 'FREE' : formatPrice(shipping)]].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', marginBottom: 12 }}>
                <span>{label}</span>
                <span style={{ color: val === 'FREE' ? '#4ade80' : '#fff' }}>{val}</span>
              </div>
            ))}

            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80', marginBottom: 12 }}>
                <span>Discount</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}

            <div style={{ borderTop: '1px solid #2a2a2a', marginTop: 16, paddingTop: 16, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Total</span>
              <span style={{ color: '#e63946', fontWeight: 800, fontSize: 20 }}>{formatPrice(total)}</span>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <Input
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
                />
                <Button
                  onClick={handleApplyCoupon}
                  loading={applyingCoupon}
                  style={{ background: '#2a2a2a', border: 'none', color: '#fff' }}
                >Apply</Button>
              </div>

              {couponData && (
                <Tag color="green" style={{ marginBottom: 12 }}>
                  ✓ Coupon "{couponCode}" applied!
                </Tag>
              )}

              <button
                onClick={() => navigate('/checkout', { state: { coupon: couponData, total, discount } })}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: '#e63946',
                  border: 'none',
                  borderRadius: 10,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  letterSpacing: 1,
                }}
              >
                PROCEED TO CHECKOUT
              </button>

              {shipping > 0 && (
                <p style={{ color: '#555', fontSize: 12, textAlign: 'center', marginTop: 12 }}>
                  Add ₹{formatPrice(1000 - subtotal)} more for FREE shipping
                </p>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}
