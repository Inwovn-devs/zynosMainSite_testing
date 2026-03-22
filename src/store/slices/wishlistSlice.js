import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/wishlist');
    return res.data.wishlist?.products || [];
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { getState, rejectWithValue }) => {
  try {
    const { items } = getState().wishlist;
    const isInWishlist = items.some((p) => (p._id || p) === productId);
    if (isInWishlist) {
      await api.delete(`/wishlist/${productId}`);
      return items.filter((p) => (p._id || p) !== productId);
    } else {
      const res = await api.post('/wishlist', { productId });
      return res.data.wishlist?.products || [];
    }
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => { state.items = action.payload; })
      .addCase(toggleWishlist.fulfilled, (state, action) => { state.items = action.payload; });
  },
});

export default wishlistSlice.reducer;
