import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Spin, Table, Tag } from 'antd';
import { ShoppingOutlined, UserOutlined, DollarOutlined, RiseOutlined } from '@ant-design/icons';
import api from '../../utils/api';
import { formatPrice, formatDate, ORDER_STATUS_COLORS } from '../../utils/helpers';

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/sales-overview'),
      api.get('/orders?limit=5&sort=createdAt&order=desc'),
      api.get('/analytics/top-products'),
    ]).then(([ov, ord, tp]) => {
      setOverview(ov.data);
      setRecentOrders(ord.data.orders || []);
      setTopProducts(tp.data.products || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  const stats = [
    { title: 'Total Revenue', value: overview?.totalRevenue || 0, icon: <DollarOutlined />, color: '#e63946', format: 'currency' },
    { title: 'Total Orders', value: overview?.totalOrders || 0, icon: <ShoppingOutlined />, color: '#3b82f6' },
    { title: 'Total Users', value: overview?.totalUsers || 0, icon: <UserOutlined />, color: '#8b5cf6' },
    { title: 'Products', value: overview?.totalProducts || 0, icon: <RiseOutlined />, color: '#f4a261' },
  ];

  const orderCols = [
    { title: 'Order #', dataIndex: 'orderNumber', render: (v) => <span style={{ color: '#fff' }}>{v}</span> },
    { title: 'Date', dataIndex: 'createdAt', render: (v) => <span style={{ color: '#666' }}>{formatDate(v)}</span> },
    { title: 'Total', dataIndex: 'total', render: (v) => <span style={{ color: '#e63946', fontWeight: 700 }}>{formatPrice(v)}</span> },
    { title: 'Status', dataIndex: 'orderStatus', render: (v) => <Tag color={ORDER_STATUS_COLORS[v]} style={{ textTransform: 'capitalize' }}>{v}</Tag> },
  ];

  const productCols = [
    {
      title: 'Product', dataIndex: 'name', render: (v, r) => (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <img src={r.images?.[0]} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
          <span style={{ color: '#fff' }}>{v}</span>
        </div>
      )
    },
    { title: 'Price', dataIndex: 'price', render: (v) => <span style={{ color: '#aaa' }}>{formatPrice(v)}</span> },
    { title: 'Stock', dataIndex: 'totalStock', render: (v) => <span style={{ color: v < 10 ? '#e63946' : '#aaa' }}>{v}</span> },
  ];

  return (
    <div>
      <h2 style={{ color: '#fff', marginBottom: 24, fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, letterSpacing: 2 }}>
        DASHBOARD
      </h2>

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {stats.map((stat) => (
          <Col xs={12} md={6} key={stat.title}>
            <Card style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: '#555', fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{stat.title}</div>
                  <div style={{ color: '#fff', fontSize: 28, fontWeight: 800 }}>
                    {stat.format === 'currency' ? formatPrice(stat.value) : stat.value.toLocaleString()}
                  </div>
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: `${stat.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, color: stat.color,
                }}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={14}>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24 }}>
            <h3 style={{ color: '#fff', marginBottom: 16 }}>Recent Orders</h3>
            <Table
              dataSource={recentOrders}
              columns={orderCols}
              rowKey="_id"
              pagination={false}
              style={{ background: 'transparent' }}
            />
          </div>
        </Col>
        <Col xs={24} md={10}>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24 }}>
            <h3 style={{ color: '#fff', marginBottom: 16 }}>Top Products</h3>
            <Table
              dataSource={topProducts}
              columns={productCols}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}
