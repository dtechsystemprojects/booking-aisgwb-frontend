import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AttendeeRecord } from '@/app/admin/dataStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AttendeeState {
  attendees: AttendeeRecord[];
  pagination?: PaginationInfo;
  loading: boolean;
  error: string | null;
}

const initialState: AttendeeState = {
  attendees: [],
  loading: false,
  error: null,
};

export const fetchAttendees = createAsyncThunk<
  { data: AttendeeRecord[]; pagination: PaginationInfo },
  { page?: number; limit?: number; search?: string } | void,
  { rejectValue: string }
>('attendees/fetchAttendees', async (params, { rejectWithValue }) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || sessionStorage.getItem('token') : null;
    let url = `${API_BASE_URL}/admin/attendees`;
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      url += `?${queryParams.toString()}`;
    }
    
    const res = await fetch(url, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (!res.ok) throw new Error('Failed to fetch attendees');
    const json = await res.json();
    if (json.success && json.data) {
      return { data: json.data, pagination: json.pagination };
    }
    return rejectWithValue('Invalid data received');
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error fetching attendees');
  }
});

export const fetchAttendeeById = createAsyncThunk<
  AttendeeRecord,
  string,
  { rejectValue: string }
>('attendees/fetchAttendeeById', async (id, { rejectWithValue }) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || sessionStorage.getItem('token') : null;
    const res = await fetch(`${API_BASE_URL}/admin/attendees/${id}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    const json = await res.json();
    if (json.success && json.data) return json.data;
    return rejectWithValue('Failed to fetch attendee');
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error fetching attendee');
  }
});

export const createAttendee = createAsyncThunk<
  AttendeeRecord,
  any,
  { rejectValue: any }
>('attendees/createAttendee', async (payload, { rejectWithValue }) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || sessionStorage.getItem('token') : null;
    const res = await fetch(`${API_BASE_URL}/admin/attendees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) return rejectWithValue(json.errors || json.message || 'Failed to create attendee');
    return json.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error creating attendee');
  }
});

export const updateAttendee = createAsyncThunk<
  AttendeeRecord,
  { id: string; payload: any },
  { rejectValue: any }
>('attendees/updateAttendee', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || sessionStorage.getItem('token') : null;
    const res = await fetch(`${API_BASE_URL}/admin/attendees/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) return rejectWithValue(json.errors || json.message || 'Failed to update attendee');
    return json.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error updating attendee');
  }
});

export const deleteAttendee = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('attendees/deleteAttendee', async (id, { rejectWithValue }) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || sessionStorage.getItem('token') : null;
    const res = await fetch(`${API_BASE_URL}/admin/attendees/${id}`, {
      method: 'DELETE',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (!res.ok) throw new Error('Failed to delete attendee');
    const json = await res.json();
    if (json.success) return id;
    return rejectWithValue(json.message || 'Failed to delete attendee');
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error deleting attendee');
  }
});

export const resendTicketEmail = createAsyncThunk<
  { success: boolean; message: string },
  { id: string; ticketPdfBase64: string; invoicePdfBase64: string },
  { rejectValue: string }
>('attendees/resendTicketEmail', async ({ id, ticketPdfBase64, invoicePdfBase64 }, { rejectWithValue }) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || sessionStorage.getItem('token') : null;
    const res = await fetch(`${API_BASE_URL}/admin/attendees/${id}/resend-ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ ticketPdfBase64, invoicePdfBase64 }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to resend ticket email');
    if (json.success) return json;
    return rejectWithValue(json.message || 'Failed to resend ticket email');
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error resending ticket email');
  }
});

const attendeeSlice = createSlice({
  name: 'attendees',
  initialState,
  reducers: {
    clearAttendeeError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendees.fulfilled, (state, action) => {
        state.loading = false;
        state.attendees = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAttendees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch attendees';
      })
      .addCase(deleteAttendee.fulfilled, (state, action) => {
        state.attendees = state.attendees.filter(a => a._id !== action.payload && a.id !== action.payload);
      })
      .addCase(updateAttendee.fulfilled, (state, action) => {
        const index = state.attendees.findIndex(a => (a._id || a.id) === (action.payload._id || action.payload.id));
        if (index !== -1) {
          // Merge the current state, the backend response, and the originally sent payload
          // This ensures that frontend-only fields like checkInTime update immediately
          state.attendees[index] = { ...state.attendees[index], ...action.payload, ...action.meta.arg.payload };
        }
      });
  }
});

export const { clearAttendeeError } = attendeeSlice.actions;
export default attendeeSlice.reducer;
