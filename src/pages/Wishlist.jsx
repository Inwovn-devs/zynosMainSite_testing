import { useSelector } from 'react-redux';
import { Row, Col, Empty } from 'antd';
import { HeartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';

export default function Wishlist() {
  const items = useSelector((s) => s.wishlist.items);

  return (
    <div style={{ maxWidth: 1280, margin: '40px auto', padding: '0 24px' }}>
      <h1 style={{ color: '#fff', fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, letterSpacing: 2, marginBottom: 32 }}>
        MY WISHLIST
      </h1>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Empty
            image={<HeartOutlined style={{ fontSize: 64, color: '#333' }} />}
            description={<span style={{ color: '#555' }}>Your wishlist is empty</span>}
          />
          <Link to="/products">
            <button style={{
              background: '#e63946', color: '#fff', border: 'none', borderRadius: 8,
              padding: '12px 32px', marginTop: 24, cursor: 'pointer', fontWeight: 700,
            }}>Explore Products</button>
          </Link>
        </div>
      ) : (
        <Row gutter={[20, 20]}>
          {items.map((product) => (
            <Col xs={12} sm={8} md={6} key={product._id || product}>
              {product._id ? (
                <ProductCard product={product} />
              ) : (
                <div style={{ background: '#111', borderRadius: 12, border: '1px solid #2a2a2a', padding: 20, color: '#555' }}>
                  Product unavailable
                </div>
              )}
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
