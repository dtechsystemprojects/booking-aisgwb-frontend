import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface BookingTicket {
  ticketId: string;
  ticketName?: string;
  price: number;
  quantity: number;
  attendees: { name: string }[];
}

export interface Booking {
  _id: string;
  eventId: any; // Populated Event object
  userId?: any; // Populated User object
  billingInfo: {
    firstName: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  tickets: BookingTicket[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  bookingStatus: string;
  createdAt: string;
  hasUsedTickets?: boolean;
}

interface BookingState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  loading: false,
  error: null,
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const fetchBookings = createAsyncThunk('bookings/fetchBookings', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/bookings`, { headers: getAuthHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch bookings');
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchBookingById = createAsyncThunk('bookings/fetchBookingById', async (id: string, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/bookings/${id}`, { headers: getAuthHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch booking');
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const createBooking = createAsyncThunk('bookings/createBooking', async (payload: Partial<Booking>, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create booking');
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const updateBooking = createAsyncThunk('bookings/updateBooking', async ({ id, payload }: { id: string; payload: Partial<Booking> }, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/bookings/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update booking');
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const deleteBooking = createAsyncThunk('bookings/deleteBooking', async (id: string, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/bookings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete booking');
    return id;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const resendBookingInvoice = createAsyncThunk('bookings/resendBookingInvoice', async ({ id, pdfBase64 }: { id: string; pdfBase64: string }, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/bookings/${id}/resend-invoice`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ pdfBase64 }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to resend invoice');
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchEventAttendees = createAsyncThunk('bookings/fetchEventAttendees', async (eventId?: string, { rejectWithValue }) => {
  try {
    let url = `${BASE_URL}/admin/attendees?limit=10000`;
    if (eventId) url += `&eventId=${eventId}`;
    const response = await fetch(url, { headers: getAuthHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch attendees');
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchUserMembership = createAsyncThunk('bookings/fetchUserMembership', async (userId: string, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/memberships/${encodeURIComponent(userId)}`, { headers: getAuthHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch membership');
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.bookings.unshift(action.payload);
      })
      .addCase(updateBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
        const index = state.bookings.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      })
      .addCase(deleteBooking.fulfilled, (state, action: PayloadAction<string>) => {
        state.bookings = state.bookings.filter((b) => b._id !== action.payload);
      });
  },
});

export default bookingSlice.reducer;

