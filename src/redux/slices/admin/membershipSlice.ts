import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") || sessionStorage.getItem("token") : null;

export const fetchMemberships = createAsyncThunk('memberships/fetchAll', async (params: { page?: number; limit?: number; status?: string } | undefined, { rejectWithValue }) => {
  try {
    const token = getToken();
    const queryParams = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_BASE_URL}/admin/memberships`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return rejectWithValue(errorData.message || 'Failed to fetch memberships');
    }
    
    return await response.json();
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const updateMembershipStatus = createAsyncThunk('memberships/updateStatus', async ({ id, status, rejectReason }: { id: string; status: string; rejectReason?: string }, { rejectWithValue }) => {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/memberships/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status, rejectReason })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return rejectWithValue(errorData.message || 'Failed to update status');
    }
    
    return await response.json();
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

const membershipSlice = createSlice({
  name: 'memberships',
  initialState: {
    data: [] as any[],
    loading: false,
    error: null as string | null,
    total: 0,
    page: 1,
    pages: 1,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMemberships.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMemberships.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchMemberships.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateMembershipStatus.fulfilled, (state, action) => {
        const updated = action.payload.data;
        const index = state.data.findIndex((m: any) => m._id === updated._id);
        if (index !== -1) {
          state.data[index] = updated;
        }
      });
  },
});

export default membershipSlice.reducer;
