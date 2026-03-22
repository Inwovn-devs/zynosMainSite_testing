import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Rate, Tag, Select, InputNumber, Tabs, Spin, Empty } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, HeartFilled, ThunderboltOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import { formatPrice, getDiscountPercent } from '../utils/helpers';

export default function ProductDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const wishlistItems = useSelector((s) => s.wishlist.items);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const isWishlisted = product && wishlistItems.some((p) => (p._id || p) === product._id);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${slug}`).then((res) => {
      setProduct(res.data.product);
      if (res.data.product.variants?.length) {
        setSelectedVariant(res.data.product.variants[0]);
      }
    }).finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (product) {
      api.get(`/reviews/product/${product._id}`).then((res) => setReviews(res.data.reviews || []));
    }
  }, [product]);

  const handleAddToCart = async (buyNow = false) => {
    if (!user) return toast.error('Please login first');
    setAdding(true);
    try {
      await dispatch(addToCart({ productId: product._id, quantity, variant: selectedVariant })).unwrap();
      toast.success('Added to cart!');
      if (buyNow) navigate('/cart');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) return toast.error('Please login');
    await dispatch(toggleWishlist(product._id));
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  if (loading) return <div style={{ padding: 80, textAlign: 'center' }}><Spin size="large" /></div>;
  if (!product) return <Empty description="Product not found" style={{ padding: 80 }} />;

  const discount = getDiscountPercent(product.price, product.discountPrice);
  const displayPrice = product.discountPrice || product.price;
  const sizes = [...new Set(product.variants?.map((v) => v.size).filter(Boolean))];
  const colors = [...new Set(product.variants?.map((v) => v.color).filter(Boolean))];

  return (
    <div style={{ maxWidth: 1280, margin: '40px auto', padding: '0 24px' }}>
      <Row gutter={[48, 32]}>
        {/* Images */}
        <Col xs={24} md={12}>
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{
              background: '#111',
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid #2a2a2a',
              aspectRatio: '1',
              marginBottom: 12,
            }}>
              <img
                src={product.images?.[selectedImage] || 'https://via.placeholder.com/600'}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {product.images?.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: i === selectedImage ? '2px solid #e63946' : '2px solid #2a2a2a',
                    flexShrink: 0,
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        </Col>

        {/* Info */}
        <Col xs={24} md={12}>
          <div style={{ color: '#e63946', fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>
            {product.brand?.name}
          </div>

          <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 800, marginBottom: 12 }}>{product.name}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Rate disabled value={product.ratings?.average || 0} style={{ fontSize: 16 }} />
            <span style={{ color: '#666', fontSize: 14 }}>({product.ratings?.count || 0} reviews)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: '#fff' }}>{formatPrice(displayPrice)}</span>
            {discount > 0 && (
              <>
                <span style={{ fontSize: 20, color: '#555', textDecoration: 'line-through' }}>{formatPrice(product.price)}</span>
                <Tag color="#e63946" style={{ fontWeight: 700, fontSize: 14 }}>-{discount}%</Tag>
              </>
            )}
          </div>

          {/* Variants */}
          {sizes.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: '#aaa', marginBottom: 8 }}>Size: <strong style={{ color: '#fff' }}>{selectedVariant?.size}</strong></p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedVariant(product.variants.find((v) => v.size === size && (!selectedVariant?.color || v.color === selectedVariant.color)) || product.variants.find((v) => v.size === size))}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: selectedVariant?.size === size ? '2px solid #e63946' : '1px solid #2a2a2a',
                      background: selectedVariant?.size === size ? 'rgba(230,57,70,0.1)' : '#1a1a1a',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >{size}</button>
                ))}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ color: '#aaa', marginBottom: 8 }}>Color: <strong style={{ color: '#fff' }}>{selectedVariant?.color}</strong></p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedVariant(product.variants.find((v) => v.color === color && (!selectedVariant?.size || v.size === selectedVariant.size)) || product.variants.find((v) => v.color === color))}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: selectedVariant?.color === color ? '2px solid #e63946' : '1px solid #2a2a2a',
                      background: selectedVariant?.color === color ? 'rgba(230,57,70,0.1)' : '#1a1a1a',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >{color}</button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div>
              <p style={{ color: '#aaa', fontSize: 13, marginBottom: 8 }}>Quantity</p>
              <InputNumber
                min={1}
                max={selectedVariant?.stock || product.totalStock || 10}
                value={quantity}
                onChange={setQuantity}
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
              />
            </div>
            <div>
              <p style={{ color: '#aaa', fontSize: 13, marginBottom: 8 }}>Stock</p>
              <Tag color={product.totalStock > 0 ? 'green' : 'red'}>
                {product.totalStock > 0 ? `${product.totalStock} available` : 'Out of Stock'}
              </Tag>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <button
              onClick={() => handleAddToCart(false)}
              disabled={adding || product.totalStock === 0}
              style={{
                flex: 1,
                minWidth: 160,
                padding: '16px 24px',
                background: '#1a1a1a',
                border: '2px solid #e63946',
                borderRadius: 10,
                color: '#e63946',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 15,
                letterSpacing: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <ShoppingCartOutlined /> ADD TO CART
            </button>
            <button
              onClick={() => handleAddToCart(true)}
              disabled={adding || product.totalStock === 0}
              style={{
                flex: 1,
                minWidth: 160,
                padding: '16px 24px',
                background: '#e63946',
                border: 'none',
                borderRadius: 10,
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 15,
                letterSpacing: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <ThunderboltOutlined /> BUY NOW
            </button>
            <button
              onClick={handleWishlist}
              style={{
                padding: '16px',
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: 10,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {isWishlisted
                ? <HeartFilled style={{ color: '#e63946', fontSize: 20 }} />
                : <HeartOutlined style={{ color: '#aaa', fontSize: 20 }} />
              }
            </button>
          </div>
        </Col>
      </Row>

      {/* Description & Reviews Tabs */}
      <div style={{ marginTop: 60, background: '#111', border: '1px solid #2a2a2a', borderRadius: 16, padding: 32 }}>
        <Tabs
          items={[
            {
              key: 'desc',
              label: 'Description',
              children: <p style={{ color: '#aaa', lineHeight: 1.8 }}>{product.description}</p>,
            },
            {
              key: 'reviews',
              label: `Reviews (${reviews.length})`,
              children: reviews.length === 0
                ? <Empty description={<span style={{ color: '#555' }}>No reviews yet</span>} />
                : reviews.map((r) => (
                  <div key={r._id} style={{ borderBottom: '1px solid #2a2a2a', paddingBottom: 16, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <strong style={{ color: '#fff' }}>{r.user?.displayName || 'User'}</strong>
                      <Rate disabled value={r.rating} style={{ fontSize: 12 }} />
                    </div>
                    <p style={{ color: '#aaa' }}>{r.body}</p>
                  </div>
                )),
            },
          ]}
        />
      </div>
    </div>
  );
}
