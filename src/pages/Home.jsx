import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Spin } from 'antd';
import { ArrowRightOutlined, ThunderboltOutlined } from '@ant-design/icons';
import api from '../utils/api';
import ProductCard from '../components/common/ProductCard';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/products?isFeatured=true&limit=8'),
      api.get('/categories?isActive=true&limit=6'),
    ]).then(([prod, cat]) => {
      setFeatured(prod.data.products || []);
      setCategories(cat.data.categories || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid #1a1a1a',
      }}>
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '50%',
          background: 'linear-gradient(to left, rgba(230,57,70,0.08) 0%, transparent 100%)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -100,
          right: -100,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(230,57,70,0.12) 0%, transparent 70%)',
        }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 700 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <ThunderboltOutlined style={{ color: '#e63946', fontSize: 16 }} />
              <span style={{ color: '#e63946', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>
                New Season Collection
              </span>
            </div>

            <h1 style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 'clamp(60px, 10vw, 120px)',
              lineHeight: 0.9,
              color: '#fff',
              marginBottom: 24,
              letterSpacing: 2,
            }}>
              GEAR UP.<br />
              <span style={{ color: '#e63946' }}>PERFORM.</span><br />
              DOMINATE.
            </h1>

            <p style={{ color: '#888', fontSize: 18, marginBottom: 40, maxWidth: 500, lineHeight: 1.7 }}>
              Premium sports equipment and apparel for athletes who refuse to settle for anything less than the best.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/products')}
                style={{
                  background: '#e63946',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '16px 36px',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  letterSpacing: 1,
                }}
              >
                SHOP NOW <ArrowRightOutlined />
              </button>
              <button
                onClick={() => navigate('/products?sale=true')}
                style={{
                  background: 'transparent',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: 8,
                  padding: '16px 36px',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: 1,
                }}
              >
                VIEW SALE
              </button>
            </div>

            <div style={{ display: 'flex', gap: 40, marginTop: 48 }}>
              {[['10K+', 'Happy Athletes'], ['500+', 'Premium Products'], ['50+', 'Top Brands']].map(([num, label]) => (
                <div key={label}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#e63946', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: 1 }}>{num}</div>
                  <div style={{ fontSize: 12, color: '#555', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ maxWidth: 1280, margin: '80px auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h2 style={{ color: '#fff', fontSize: 32, fontFamily: 'Bebas Neue, sans-serif', letterSpacing: 2, margin: 0 }}>
            SHOP BY CATEGORY
          </h2>
          <Link to="/products" style={{ color: '#e63946', fontWeight: 600, fontSize: 14 }}>
            View All <ArrowRightOutlined />
          </Link>
        </div>

        {loading ? <Spin /> : (
          <Row gutter={[16, 16]}>
            {categories.map((cat) => (
              <Col xs={12} sm={8} md={4} key={cat._id}>
                <Link to={`/products?category=${cat._id}`}>
                  <div style={{
                    background: '#111',
                    border: '1px solid #2a2a2a',
                    borderRadius: 12,
                    padding: 20,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#e63946'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {cat.image && (
                      <img src={cat.image} alt={cat.name}
                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }}
                      />
                    )}
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{cat.name}</div>
                  </div>
                </Link>
              </Col>
            ))}
          </Row>
        )}
      </section>

      {/* Featured Products */}
      <section style={{ maxWidth: 1280, margin: '0 auto 80px', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h2 style={{ color: '#fff', fontSize: 32, fontFamily: 'Bebas Neue, sans-serif', letterSpacing: 2, margin: 0 }}>
            FEATURED GEAR
          </h2>
          <Link to="/products" style={{ color: '#e63946', fontWeight: 600, fontSize: 14 }}>
            View All <ArrowRightOutlined />
          </Link>
        </div>

        {loading ? <Spin /> : (
          <Row gutter={[20, 20]}>
            {featured.map((product) => (
              <Col xs={12} sm={8} md={6} key={product._id}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        )}
      </section>

      {/* Sale Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #e63946 0%, #c1121f 100%)',
        padding: '60px 24px',
        textAlign: 'center',
        marginBottom: 80,
      }}>
        <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 56, color: '#fff', margin: 0, letterSpacing: 3 }}>
          UP TO 50% OFF
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, margin: '12px 0 32px' }}>
          Limited time offer on selected sports gear
        </p>
        <button
          onClick={() => navigate('/products?sale=true')}
          style={{
            background: '#fff',
            color: '#e63946',
            border: 'none',
            borderRadius: 8,
            padding: '14px 40px',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: 1,
          }}
        >
          SHOP SALE
        </button>
      </section>
    </div>
  );
}
