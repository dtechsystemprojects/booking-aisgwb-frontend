import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const fetchMembershipSettings = createAsyncThunk(
  'membership/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/memberships/settings`);
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch settings');
      }
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyMembership = createAsyncThunk(
  'membership/fetchMy',
  async (userId: string, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || sessionStorage.getItem('token') : null;

      // Pass userId as a query param so the server can return only that user's row
      const url = `${API_URL}/memberships/membership/${encodeURIComponent(userId)}`;

      const response = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch membership');
      }
      const data = await response.json();

      // Case 1: server returned a single membership object directly
      if (data.success && data.data && !Array.isArray(data.data)) {
        return data.data;
      }
      // Case 2: server returned an array — filter by userId as a fallback
      if (data.success && Array.isArray(data.data)) {
        const myMem = data.data.find((m: any) => m.userId === userId || m.userId?._id === userId);
        return myMem || null;
      }
      // Case 3: raw array at root
      if (Array.isArray(data)) {
        const myMem = data.find((m: any) => m.userId === userId || m.userId?._id === userId);
        return myMem || null;
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const applyMembership = createAsyncThunk(
  'membership/apply',
  async (payload: any, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || sessionStorage.getItem('token') : null;
      const response = await fetch(`${API_URL}/memberships/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to apply for membership');
      }
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const membershipSlice = createSlice({
  name: 'membership',
  initialState: {
    loading: false,
    settings: null,
    myMembership: null as any | null,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembershipSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembershipSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchMembershipSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(applyMembership.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyMembership.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(applyMembership.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMyMembership.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyMembership.fulfilled, (state, action) => {
        state.loading = false;
        state.myMembership = action.payload;
      })
      .addCase(fetchMyMembership.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default membershipSlice.reducer;
