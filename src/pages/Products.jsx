import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Row, Col, Slider, Checkbox, Select, Pagination, Collapse, Empty, Spin, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import api from '../utils/api';
import ProductCard from '../components/common/ProductCard';

const { Option } = Select;
const { Panel } = Collapse;

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 12, sort };
    if (search) params.search = search;
    if (category) params.category = category;
    if (brand) params.brand = brand;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (searchParams.get('sale') === 'true') params.sale = true;

    api.get('/products', { params })
      .then((res) => {
        setProducts(res.data.products || []);
        setTotal(res.data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [page, search, category, brand, sort, minPrice, maxPrice, searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/brands')]).then(([c, b]) => {
      setCategories(c.data.categories || []);
      setBrands(b.data.brands || []);
    });
  }, []);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ color: '#fff', fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, letterSpacing: 2, margin: 0 }}>
          {search ? `Results for "${search}"` : 'ALL PRODUCTS'}
        </h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: '#666', fontSize: 14 }}>{total} products</span>
          <Select
            value={sort}
            onChange={(v) => updateParam('sort', v)}
            style={{ width: 160 }}
          >
            <Option value="newest">Newest</Option>
            <Option value="price-asc">Price: Low to High</Option>
            <Option value="price-desc">Price: High to Low</Option>
            <Option value="rating">Top Rated</Option>
          </Select>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Filters sidebar */}
        <Col xs={24} md={6}>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20 }}>
            <h3 style={{ color: '#fff', marginBottom: 16 }}>Filters</h3>

            <Input
              placeholder="Search..."
              prefix={<SearchOutlined style={{ color: '#555' }} />}
              value={searchParams.get('search') || ''}
              onChange={(e) => updateParam('search', e.target.value)}
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', marginBottom: 16 }}
            />

            <Collapse ghost>
              <Panel header={<span style={{ color: '#fff' }}>Category</span>} key="cat">
                {categories.map((cat) => (
                  <div key={cat._id} style={{ marginBottom: 8 }}>
                    <Checkbox
                      checked={category === cat._id}
                      onChange={(e) => updateParam('category', e.target.checked ? cat._id : '')}
                      style={{ color: '#aaa' }}
                    >{cat.name}</Checkbox>
                  </div>
                ))}
              </Panel>

              <Panel header={<span style={{ color: '#fff' }}>Brand</span>} key="brand">
                {brands.map((b) => (
                  <div key={b._id} style={{ marginBottom: 8 }}>
                    <Checkbox
                      checked={brand === b._id}
                      onChange={(e) => updateParam('brand', e.target.checked ? b._id : '')}
                      style={{ color: '#aaa' }}
                    >{b.name}</Checkbox>
                  </div>
                ))}
              </Panel>

              <Panel header={<span style={{ color: '#fff' }}>Price Range</span>} key="price">
                <Slider
                  range
                  min={0}
                  max={50000}
                  defaultValue={[parseInt(minPrice) || 0, parseInt(maxPrice) || 50000]}
                  onAfterChange={([min, max]) => {
                    updateParam('minPrice', min > 0 ? String(min) : '');
                    updateParam('maxPrice', max < 50000 ? String(max) : '');
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: 12 }}>
                  <span>₹{minPrice || 0}</span>
                  <span>₹{maxPrice || '50,000'}</span>
                </div>
              </Panel>
            </Collapse>
          </div>
        </Col>

        {/* Products grid */}
        <Col xs={24} md={18}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
          ) : products.length === 0 ? (
            <Empty description={<span style={{ color: '#666' }}>No products found</span>} />
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {products.map((product) => (
                  <Col xs={12} sm={8} md={8} key={product._id}>
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>

              {total > 12 && (
                <div style={{ textAlign: 'center', marginTop: 32 }}>
                  <Pagination
                    current={page}
                    total={total}
                    pageSize={12}
                    onChange={(p) => {
                      const next = new URLSearchParams(searchParams);
                      next.set('page', String(p));
                      setSearchParams(next);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </Col>
      </Row>
    </div>
  );
}
