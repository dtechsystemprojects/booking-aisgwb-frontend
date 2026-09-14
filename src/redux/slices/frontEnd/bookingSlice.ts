import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface BookingState {
  bookings: any[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  loading: false,
  error: null,
};

export const fetchFrontendBookings = createAsyncThunk(
  "frontendBooking/fetchBookings",
  async (_, { rejectWithValue }) => {
    try {
      let token = null;
      if (typeof window !== "undefined") {
        token = localStorage.getItem("token");
      }

      const response = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || data.error || "Failed to fetch bookings");
      }
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error occurred");
    }
  }
);

export const downloadTicketPdf = createAsyncThunk(
  "frontendBooking/downloadTicketPdf",
  async ({ bookingId, attendeeId }: { bookingId: string, attendeeId: string }, { rejectWithValue }) => {
    try {
      let token = null;
      if (typeof window !== "undefined") {
        token = localStorage.getItem("token");
      }

      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/ticket/${attendeeId}/pdf`, {
        method: "GET",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        // If it's a JSON error response instead of a PDF
        if (response.headers.get("content-type")?.includes("application/json")) {
           const errorData = await response.json();
           return rejectWithValue(errorData.message || "Failed to download ticket PDF");
        }
        return rejectWithValue("Failed to download ticket PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      
      return true;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error occurred");
    }
  }
);

const bookingSlice = createSlice({
  name: "frontendBooking",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchFrontendBookings.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFrontendBookings.fulfilled, (state, action) => {
      state.loading = false;
      state.bookings = action.payload || [];
    });
    builder.addCase(fetchFrontendBookings.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Failed to fetch bookings";
    });
  },
});

export default bookingSlice.reducer;
