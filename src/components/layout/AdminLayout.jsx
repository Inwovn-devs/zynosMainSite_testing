import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined, AppstoreOutlined, TagsOutlined, ShoppingOutlined,
  UserOutlined, PercentageOutlined, PictureOutlined, BarcodeOutlined, LogoutOutlined,
} from '@ant-design/icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

const { Sider, Content, Header } = Layout;

const menuItems = [
  { key: '/admin', icon: <DashboardOutlined />, label: <Link to="/admin">Dashboard</Link> },
  { key: '/admin/products', icon: <AppstoreOutlined />, label: <Link to="/admin/products">Products</Link> },
  { key: '/admin/categories', icon: <TagsOutlined />, label: <Link to="/admin/categories">Categories</Link> },
  { key: '/admin/brands', icon: <BarcodeOutlined />, label: <Link to="/admin/brands">Brands</Link> },
  { key: '/admin/orders', icon: <ShoppingOutlined />, label: <Link to="/admin/orders">Orders</Link> },
  { key: '/admin/users', icon: <UserOutlined />, label: <Link to="/admin/users">Users</Link> },
  { key: '/admin/coupons', icon: <PercentageOutlined />, label: <Link to="/admin/coupons">Coupons</Link> },
  { key: '/admin/banners', icon: <PictureOutlined />, label: <Link to="/admin/banners">Banners</Link> },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedKey = '/' + location.pathname.split('/').slice(0, 3).join('/').replace(/^\//, '');

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Sider
        width={220}
        style={{ background: '#0d0d0d', borderRight: '1px solid #1a1a1a', position: 'fixed', height: '100vh', overflow: 'auto' }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #1a1a1a' }}>
          <Link to="/">
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: '#e63946', letterSpacing: 3 }}>ZYNOS</span>
          </Link>
          <p style={{ color: '#444', fontSize: 11, marginTop: 4 }}>Admin Panel</p>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ background: 'transparent', border: 'none', marginTop: 8 }}
        />

        <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, padding: '0 16px' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', background: 'transparent', border: '1px solid #2a2a2a',
              color: '#666', padding: '8px', borderRadius: 8, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
            }}
          >
            <LogoutOutlined /> Logout
          </button>
        </div>
      </Sider>

      <Layout style={{ marginLeft: 220, background: '#0a0a0a' }}>
        <Header style={{
          background: '#0d0d0d',
          borderBottom: '1px solid #1a1a1a',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: 18, fontWeight: 600 }}>
            {menuItems.find((m) => m.key === location.pathname)?.label?.props?.children || 'Admin'}
          </h2>
          <Link to="/" style={{ color: '#666', fontSize: 13 }}>← Back to Store</Link>
        </Header>

        <Content style={{ padding: 24, minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
