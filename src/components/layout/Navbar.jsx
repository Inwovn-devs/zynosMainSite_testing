import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Badge, Dropdown, Avatar, Input } from 'antd';
import {
  ShoppingCartOutlined,
  HeartOutlined,
  UserOutlined,
  SearchOutlined,
  MenuOutlined,
  CloseOutlined,
  LogoutOutlined,
  DashboardOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import toast from 'react-hot-toast';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, dbUser } = useSelector((s) => s.auth);
  const cartItems = useSelector((s) => s.cart.items);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('Logged out');
    navigate('/');
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: <Link to="/profile">Profile</Link> },
    { key: 'orders', icon: <ShoppingOutlined />, label: <Link to="/orders">My Orders</Link> },
    ...(dbUser?.role === 'admin' || dbUser?.role === 'sub-admin'
      ? [{ key: 'admin', icon: <DashboardOutlined />, label: <Link to="/admin">Admin Panel</Link> }]
      : []),
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout, danger: true },
  ];

  return (
    <nav style={{
      background: '#0a0a0a',
      borderBottom: '1px solid #1a1a1a',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        height: 64,
        gap: 24,
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <span style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: 28,
            color: '#e63946',
            letterSpacing: 3,
          }}>ZYNOS</span>
        </Link>

        {/* Nav Links - desktop */}
        <div style={{ display: 'flex', gap: 24, '@media(maxWidth:768px)': { display: 'none' } }} className="nav-links">
          {[['Products', '/products'], ['Brands', '/products?view=brands'], ['Sale', '/products?sale=true']].map(([label, path]) => (
            <Link key={label} to={path} style={{
              color: '#aaa',
              fontSize: 14,
              fontWeight: 500,
              transition: 'color 0.2s',
            }}
              onMouseEnter={(e) => e.target.style.color = '#fff'}
              onMouseLeave={(e) => e.target.style.color = '#aaa'}
            >{label}</Link>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 400 }}>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sports gear..."
            prefix={<SearchOutlined style={{ color: '#666' }} />}
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8 }}
          />
        </form>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto' }}>
          {user && (
            <Link to="/wishlist">
              <HeartOutlined style={{ fontSize: 20, color: '#aaa' }} />
            </Link>
          )}

          <Link to="/cart">
            <Badge count={cartCount} color="#e63946">
              <ShoppingCartOutlined style={{ fontSize: 22, color: '#aaa' }} />
            </Badge>
          </Link>

          {user ? (
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
              <Avatar
                src={user.photoURL}
                icon={<UserOutlined />}
                style={{ cursor: 'pointer', background: '#e63946' }}
                size={36}
              />
            </Dropdown>
          ) : (
            <Link to="/login">
              <button style={{
                background: '#e63946',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 20px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14,
              }}>Login</button>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ display: 'none', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            className="mobile-menu-btn"
          >
            {mobileOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
