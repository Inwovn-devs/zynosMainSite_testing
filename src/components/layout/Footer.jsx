import { Link } from 'react-router-dom';
import { Row, Col, Input, Button } from 'antd';
import { InstagramOutlined, TwitterOutlined, YoutubeOutlined, FacebookOutlined } from '@ant-design/icons';

export default function Footer() {
  return (
    <footer style={{ background: '#0d0d0d', borderTop: '1px solid #1a1a1a', paddingTop: 48, marginTop: 80 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <Row gutter={[48, 32]}>
          <Col xs={24} md={8}>
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: '#e63946', letterSpacing: 3 }}>ZYNOS</span>
            <p style={{ color: '#666', marginTop: 12, lineHeight: 1.8, fontSize: 14 }}>
              Premium sports gear for athletes who demand the best. Gear up. Perform. Dominate.
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
              {[InstagramOutlined, TwitterOutlined, YoutubeOutlined, FacebookOutlined].map((Icon, i) => (
                <Icon key={i} style={{ fontSize: 20, color: '#666', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.color = '#e63946'}
                  onMouseLeave={(e) => e.target.style.color = '#666'}
                />
              ))}
            </div>
          </Col>

          <Col xs={12} md={4}>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: 16 }}>Shop</h4>
            {[['All Products', '/products'], ['Sale', '/products?sale=true'], ['New Arrivals', '/products?sort=newest'], ['Brands', '/products?view=brands']].map(([label, path]) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <Link to={path} style={{ color: '#666', fontSize: 14, transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.color = '#fff'}
                  onMouseLeave={(e) => e.target.style.color = '#666'}
                >{label}</Link>
              </div>
            ))}
          </Col>

          <Col xs={12} md={4}>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: 16 }}>Account</h4>
            {[['My Orders', '/orders'], ['Profile', '/profile'], ['Wishlist', '/wishlist'], ['Cart', '/cart']].map(([label, path]) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <Link to={path} style={{ color: '#666', fontSize: 14, transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.color = '#fff'}
                  onMouseLeave={(e) => e.target.style.color = '#666'}
                >{label}</Link>
              </div>
            ))}
          </Col>

          <Col xs={24} md={8}>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: 16 }}>Stay Updated</h4>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>
              Subscribe for exclusive deals and new arrivals.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Input
                placeholder="Enter your email"
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', flex: 1 }}
              />
              <Button style={{ background: '#e63946', border: 'none', color: '#fff', fontWeight: 600 }}>
                Subscribe
              </Button>
            </div>
          </Col>
        </Row>

        <div style={{
          borderTop: '1px solid #1a1a1a',
          marginTop: 40,
          paddingTop: 24,
          paddingBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <p style={{ color: '#444', fontSize: 13 }}>© 2025 ZYNOS. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy Policy', 'Terms of Service', 'Return Policy'].map((label) => (
              <span key={label} style={{ color: '#444', fontSize: 13, cursor: 'pointer' }}>{label}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
