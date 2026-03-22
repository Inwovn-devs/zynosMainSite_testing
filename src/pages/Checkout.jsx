import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Radio, Form, Input, Button, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { clearCart } from '../store/slices/cartSlice';
import { formatPrice, loadRazorpay } from '../utils/helpers';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);

  const { coupon, total: cartTotal, discount } = location.state || {};

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [form] = Form.useForm();

  const subtotal = items.reduce((sum, item) => {
    return sum + (item.product?.discountPrice || item.product?.price || 0) * item.quantity;
  }, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const finalTotal = cartTotal || (subtotal + shipping - (discount || 0));

  useEffect(() => {
    api.get('/addresses').then((res) => {
      const addrs = res.data.addresses || [];
      setAddresses(addrs);
      const def = addrs.find((a) => a.isDefault) || addrs[0];
      if (def) setSelectedAddress(def._id);
    }).finally(() => setLoading(false));
  }, []);

  const handleAddAddress = async (values) => {
    try {
      const res = await api.post('/addresses', values);
      const addrs = res.data.addresses || [...addresses, res.data.address];
      setAddresses(addrs);
      setSelectedAddress(addrs[addrs.length - 1]?._id);
      setShowAddForm(false);
      form.resetFields();
      toast.success('Address added');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePayment = async () => {
    if (!selectedAddress) return toast.error('Please select a delivery address');
    setProcessing(true);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Razorpay failed to load');

      // Create Razorpay order
      const orderRes = await api.post('/payments/create-order', {
        amount: finalTotal,
        currency: 'INR',
        receipt: `order_${Date.now()}`,
      });

      const { id: razorpayOrderId, amount, currency } = orderRes.data.order;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: 'ZYNOS',
        description: 'Sports Gear Purchase',
        order_id: razorpayOrderId,
        prefill: {
          name: user?.displayName,
          email: user?.email,
        },
        theme: { color: '#e63946' },
        handler: async (response) => {
          try {
            // Verify payment
            const verifyRes = await api.post('/payments/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              addressId: selectedAddress,
              couponCode: coupon?.code,
              items: items.map((item) => ({
                product: item.product._id,
                name: item.product.name,
                image: item.product.images?.[0],
                price: item.product.discountPrice || item.product.price,
                quantity: item.quantity,
                variant: item.variant,
              })),
              total: finalTotal,
              subtotal,
              discount: discount || 0,
              shippingCharge: shipping,
            });

            dispatch(clearCart());
            toast.success('Payment successful!');
            navigate(`/order-success/${verifyRes.data.order._id}`);
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast.error('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.message);
      setProcessing(false);
    }
  };

  if (loading) return <div style={{ padding: 80, textAlign: 'center' }}><Spin /></div>;

  return (
    <div style={{ maxWidth: 1280, margin: '40px auto', padding: '0 24px' }}>
      <h1 style={{ color: '#fff', fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, letterSpacing: 2, marginBottom: 32 }}>
        CHECKOUT
      </h1>

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={16}>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <h3 style={{ color: '#fff', marginBottom: 20 }}>Delivery Address</h3>

            <Radio.Group value={selectedAddress} onChange={(e) => setSelectedAddress(e.target.value)} style={{ width: '100%' }}>
              {addresses.map((addr) => (
                <Radio key={addr._id} value={addr._id} style={{ display: 'block', marginBottom: 16, color: '#aaa' }}>
                  <div style={{ marginLeft: 8 }}>
                    <strong style={{ color: '#fff' }}>{addr.name}</strong> · {addr.phone}
                    <div style={{ color: '#666', fontSize: 13 }}>
                      {addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}
                    </div>
                  </div>
                </Radio>
              ))}
            </Radio.Group>

            {!showAddForm ? (
              <Button
                icon={<PlusOutlined />}
                onClick={() => setShowAddForm(true)}
                style={{ marginTop: 12, background: 'transparent', border: '1px solid #2a2a2a', color: '#aaa' }}
              >
                Add New Address
              </Button>
            ) : (
              <Form form={form} layout="vertical" onFinish={handleAddAddress} style={{ marginTop: 20 }}>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="name" rules={[{ required: true }]}>
                      <Input placeholder="Full Name" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="phone" rules={[{ required: true }]}>
                      <Input placeholder="Phone Number" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item name="addressLine1" rules={[{ required: true }]}>
                      <Input placeholder="Address Line 1" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="city" rules={[{ required: true }]}>
                      <Input placeholder="City" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="state" rules={[{ required: true }]}>
                      <Input placeholder="State" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="pincode" rules={[{ required: true }]}>
                      <Input placeholder="PIN Code" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
                    </Form.Item>
                  </Col>
                </Row>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Button htmlType="submit" style={{ background: '#e63946', border: 'none', color: '#fff' }}>Save Address</Button>
                  <Button onClick={() => setShowAddForm(false)} style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#aaa' }}>Cancel</Button>
                </div>
              </Form>
            )}
          </div>
        </Col>

        <Col xs={24} lg={8}>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24, position: 'sticky', top: 80 }}>
            <h3 style={{ color: '#fff', marginBottom: 20 }}>Order Summary</h3>

            <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 16 }}>
              {items.map((item) => (
                <div key={item.product._id} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <img src={item.product.images?.[0]} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{item.product.name}</div>
                    <div style={{ color: '#666', fontSize: 12 }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                    {formatPrice((item.product.discountPrice || item.product.price) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {[['Subtotal', formatPrice(subtotal)], ['Shipping', shipping === 0 ? 'FREE' : formatPrice(shipping)], ...(discount ? [['Discount', `-${formatPrice(discount)}`]] : [])].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: 10, fontSize: 14 }}>
                <span>{label}</span>
                <span style={{ color: val === 'FREE' || val.startsWith('-') ? '#4ade80' : '#aaa' }}>{val}</span>
              </div>
            ))}

            <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: 16, marginTop: 8, display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Total</span>
              <span style={{ color: '#e63946', fontWeight: 800, fontSize: 20 }}>{formatPrice(finalTotal)}</span>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing}
              style={{
                width: '100%',
                padding: '16px',
                background: processing ? '#333' : '#e63946',
                border: 'none',
                borderRadius: 10,
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
                cursor: processing ? 'not-allowed' : 'pointer',
                letterSpacing: 1,
              }}
            >
              {processing ? 'Processing...' : `PAY ${formatPrice(finalTotal)}`}
            </button>
          </div>
        </Col>
      </Row>
    </div>
  );
}
