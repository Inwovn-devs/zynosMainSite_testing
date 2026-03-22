import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Rate, Tag } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import toast from 'react-hot-toast';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/wishlistSlice';
import { formatPrice, getDiscountPercent } from '../../utils/helpers';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const wishlistItems = useSelector((s) => s.wishlist.items);
  const [adding, setAdding] = useState(false);

  const isWishlisted = wishlistItems.some((p) => (p._id || p) === product._id);
  const discount = getDiscountPercent(product.price, product.discountPrice);
  const displayPrice = product.discountPrice || product.price;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to add to cart');
    setAdding(true);
    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login');
    try {
      await dispatch(toggleWishlist(product._id)).unwrap();
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Link to={`/products/${product.slug}`} style={{ display: 'block' }}>
      <div className="product-card">
        <div className="product-card__image-wrap">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/300x300?text=No+Image'}
            alt={product.name}
            className="product-card__image"
          />
          {discount > 0 && (
            <Tag color="#e63946" className="product-card__discount-badge">-{discount}%</Tag>
          )}
          <button className="product-card__wishlist-btn" onClick={handleWishlist}>
            {isWishlisted
              ? <HeartFilled style={{ color: '#e63946' }} />
              : <HeartOutlined style={{ color: '#fff' }} />
            }
          </button>
        </div>

        <div className="product-card__info">
          <p className="product-card__brand">{product.brand?.name}</p>
          <h3 className="product-card__name">{product.name}</h3>
          <Rate disabled defaultValue={product.ratings?.average || 0} style={{ fontSize: 12 }} />

          <div className="product-card__price-row">
            <span className="product-card__price">{formatPrice(displayPrice)}</span>
            {discount > 0 && (
              <span className="product-card__original-price">{formatPrice(product.price)}</span>
            )}
          </div>

          <button
            className="product-card__add-btn"
            onClick={handleAddToCart}
            disabled={adding || product.totalStock === 0}
          >
            <ShoppingCartOutlined />
            {product.totalStock === 0 ? 'Out of Stock' : adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>

        <style>{`
          .product-card {
            background: #111111;
            border: 1px solid #2a2a2a;
            border-radius: 12px;
            overflow: hidden;
            transition: transform 0.2s, box-shadow 0.2s;
            cursor: pointer;
          }
          .product-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 40px rgba(230, 57, 70, 0.15);
            border-color: #e63946;
          }
          .product-card__image-wrap {
            position: relative;
            aspect-ratio: 1;
            overflow: hidden;
          }
          .product-card__image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s;
          }
          .product-card:hover .product-card__image { transform: scale(1.05); }
          .product-card__discount-badge {
            position: absolute;
            top: 10px;
            left: 10px;
            font-weight: 700;
            border: none;
          }
          .product-card__wishlist-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.6);
            border: none;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 16px;
            transition: background 0.2s;
          }
          .product-card__wishlist-btn:hover { background: rgba(230,57,70,0.3); }
          .product-card__info { padding: 14px; }
          .product-card__brand {
            color: #e63946;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 4px;
          }
          .product-card__name {
            color: #fff;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .product-card__price-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 8px 0;
          }
          .product-card__price { color: #fff; font-weight: 700; font-size: 16px; }
          .product-card__original-price { color: #666; font-size: 13px; text-decoration: line-through; }
          .product-card__add-btn {
            width: 100%;
            padding: 8px;
            background: #e63946;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: background 0.2s;
            font-size: 13px;
          }
          .product-card__add-btn:hover:not(:disabled) { background: #c1121f; }
          .product-card__add-btn:disabled { background: #333; cursor: not-allowed; }
        `}</style>
      </div>
    </Link>
  );
}
