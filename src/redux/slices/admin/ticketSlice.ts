import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface Ticket {
  id?: string;
  _id?: string;
  eventId: string;
  ticketName: string;
  groupId?: string | null;
  numberOfTickets: number;
  ticketPrice: number;
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  minQuantity: number;
  maxQuantity: number;
  description?: string | null;
  isActive: boolean;
}

interface TicketState {
  tickets: Ticket[];
  ticketGroups: any[];
  loading: boolean;
  error: string | null;
}

const initialState: TicketState = {
  tickets: [],
  ticketGroups: [],
  loading: false,
  error: null,
};

const getToken = () => {
  return typeof window !== "undefined"
    ? localStorage.getItem("token") || sessionStorage.getItem("token")
    : null;
};

export const fetchTickets = createAsyncThunk(
  "tickets/fetchTickets",
  async (eventId: string, { rejectWithValue }) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/admin/tickets/event/${eventId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch tickets");
      const json = await res.json();
      if (json.success && json.data) return json.data;
      return rejectWithValue(json.message || "Invalid data received");
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch tickets");
    }
  }
);

export const fetchTicketGroups = createAsyncThunk(
  "tickets/fetchTicketGroups",
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/admin/tickets/groups`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch ticket groups");
      const json = await res.json();
      if (json.success && json.data) return json.data;
      return rejectWithValue(json.message || "Invalid data received");
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch ticket groups");
    }
  }
);

export const addTicket = createAsyncThunk(
  "tickets/addTicket",
  async ({ eventId, ticketData }: { eventId: string; ticketData: Ticket }, { rejectWithValue }) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/admin/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(ticketData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to add ticket");
      if (json.success && json.data) return json.data;
      return rejectWithValue(json.message || "Invalid data received");
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to add ticket");
    }
  }
);

export const updateTicket = createAsyncThunk(
  "tickets/updateTicket",
  async ({ eventId, ticketId, ticketData }: { eventId: string; ticketId: string; ticketData: Partial<Ticket> }, { rejectWithValue }) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/admin/tickets/${ticketId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(ticketData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update ticket");
      if (json.success && json.data) return json.data;
      return rejectWithValue(json.message || "Invalid data received");
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update ticket");
    }
  }
);

export const deleteTicket = createAsyncThunk(
  "tickets/deleteTicket",
  async ({ eventId, ticketId }: { eventId: string; ticketId: string }, { rejectWithValue }) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/admin/tickets/${ticketId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to delete ticket");
      return ticketId;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete ticket");
    }
  }
);

const ticketSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    clearTicketError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action: PayloadAction<Ticket[]>) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTicketGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketGroups.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loading = false;
        state.ticketGroups = action.payload;
      })
      .addCase(fetchTicketGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTicket.fulfilled, (state, action: PayloadAction<Ticket>) => {
        state.loading = false;
        state.tickets.unshift(action.payload);
      })
      .addCase(addTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTicket.fulfilled, (state, action: PayloadAction<Ticket>) => {
        state.loading = false;
        const index = state.tickets.findIndex(
          (t) => (t._id || t.id) === (action.payload._id || action.payload.id)
        );
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTicket.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.tickets = state.tickets.filter(
          (t) => (t._id || t.id) !== action.payload
        );
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTicketError } = ticketSlice.actions;
export default ticketSlice.reducer;
