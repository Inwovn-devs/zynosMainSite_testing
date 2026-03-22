import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const syncUser = createAsyncThunk('auth/syncUser', async (_, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/sync');
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    dbUser: null,
    loading: true,
    syncing: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      // keep loading true until syncUser completes
    },
    setDbUser: (state, action) => {
      state.dbUser = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.dbUser = null;
      state.loading = false;
      state.syncing = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncUser.pending, (state) => {
        state.syncing = true;
      })
      .addCase(syncUser.fulfilled, (state, action) => {
        state.dbUser = action.payload;
        state.loading = false;
        state.syncing = false;
      })
      .addCase(syncUser.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
        state.syncing = false;
      });
  },
});

export const { setUser, setDbUser, clearUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
