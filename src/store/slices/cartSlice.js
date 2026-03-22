import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/cart');
    return res.data.cart;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const addToCart = createAsyncThunk('cart/add', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/cart', payload);
    return res.data.cart;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ productId, quantity, variant }, { rejectWithValue }) => {
  try {
    const res = await api.put('/cart', { productId, quantity, variant });
    return res.data.cart;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async ({ productId, variant }, { rejectWithValue }) => {
  try {
    const res = await api.delete('/cart', { data: { productId, variant } });
    return res.data.cart;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await api.delete('/cart/all');
    return [];
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      state.items = action.payload?.items || [];
      state.loading = false;
    };
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(addToCart.fulfilled, setCart)
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(removeFromCart.fulfilled, setCart)
      .addCase(clearCart.fulfilled, (state) => { state.items = []; })
      .addMatcher(
        (action) => action.type.startsWith('cart/') && action.type.endsWith('/rejected'),
        (state, action) => { state.loading = false; state.error = action.payload; }
      );
  },
});

export default cartSlice.reducer;
