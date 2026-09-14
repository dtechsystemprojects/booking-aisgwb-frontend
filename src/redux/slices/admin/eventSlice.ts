import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { EventRecord } from "@/app/admin/dataStore";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface EventState {
  events: EventRecord[];
  pagination?: PaginationInfo;
  loading: boolean;
  error: string | null;
}

const initialState: EventState = {
  events: [],
  loading: false,
  error: null,
};

export const fetchEvents = createAsyncThunk<
  EventRecord[],
  { page?: number; limit?: number; search?: string } | void,
  { rejectValue: string }
>("events/fetchEvents", async (params, { rejectWithValue }) => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null;
    let url = `${API_BASE_URL}/admin/events`;
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      url += `?${queryParams.toString()}`;
    }
    
    const res = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error("Failed to fetch events");
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return rejectWithValue("Invalid data received");
  } catch (error: any) {
    return rejectWithValue(error.message || "Error fetching events");
  }
});

export const fetchEventById = createAsyncThunk<
  any,
  string,
  { rejectValue: string }
>("events/fetchEventById", async (id, { rejectWithValue }) => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null;
    const res = await fetch(`${API_BASE_URL}/admin/events/${id}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error("Failed to fetch event details");
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return rejectWithValue("Invalid data received");
  } catch (error: any) {
    return rejectWithValue(error.message || "Error fetching event details");
  }
});

export const addEvent = createAsyncThunk<
  EventRecord,
  EventRecord,
  { rejectValue: any }
>("events/addEvent", async (record, { rejectWithValue }) => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null;
    const bodyData = { ...record } as any;
    delete bodyData._id;
    delete bodyData.id;
    delete bodyData.createdAt;
    delete bodyData.updatedAt;
    delete bodyData.__v;

    const res = await fetch(`${API_BASE_URL}/admin/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(bodyData),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return rejectWithValue(json);
    }
    return json.data;
  } catch (error: any) {
    return rejectWithValue(error.message || "Error adding event");
  }
});

export const updateEvent = createAsyncThunk<
  EventRecord,
  EventRecord,
  { rejectValue: any }
>("events/updateEvent", async (record, { rejectWithValue }) => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null;
    const eventId = record._id || record.id;
    
    const bodyData = { ...record } as any;
    delete bodyData._id;
    delete bodyData.id;
    delete bodyData.createdAt;
    delete bodyData.updatedAt;
    delete bodyData.__v;

    const res = await fetch(`${API_BASE_URL}/admin/events/${eventId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(bodyData),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return rejectWithValue(json);
    }
    return json.data;
  } catch (error: any) {
    return rejectWithValue(error.message || "Error updating event");
  }
});

export const deleteEvent = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("events/deleteEvent", async (id, { rejectWithValue }) => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null;
    const res = await fetch(`${API_BASE_URL}/admin/events/${id}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error("Failed to delete event");
    const json = await res.json();
    if (json.success) {
      return id;
    }
    return rejectWithValue(json.message || "Failed to delete event");
  } catch (error: any) {
    return rejectWithValue(error.message || "Error deleting event");
  }
});

const eventSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    clearEventError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchEvents.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchEvents.fulfilled, (state, action) => {
      state.loading = false;
      state.events = action.payload;
    });
    builder.addCase(fetchEvents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch events";
    });

    // Add
    builder.addCase(addEvent.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addEvent.fulfilled, (state, action) => {
      state.loading = false;
      state.events.push(action.payload);
    });
    builder.addCase(addEvent.rejected, (state, action) => {
      state.loading = false;
      if (typeof action.payload === "object" && action.payload?.errors) {
        state.error = null;
      } else {
        state.error =
          action.payload?.message || action.payload || "Failed to add event";
      }
    });

    // Update
    builder.addCase(updateEvent.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateEvent.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.events.findIndex(
        (e) => (e._id || e.id) === (action.payload._id || action.payload.id)
      );
      if (index !== -1) {
        state.events[index] = action.payload;
      }
    });
    builder.addCase(updateEvent.rejected, (state, action) => {
      state.loading = false;
      if (typeof action.payload === "object" && action.payload?.errors) {
        state.error = null;
      } else {
        state.error =
          action.payload?.message || action.payload || "Failed to update event";
      }
    });

    // Delete
    builder.addCase(deleteEvent.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteEvent.fulfilled, (state, action) => {
      state.loading = false;
      state.events = state.events.filter(
        (e) => (e._id || e.id) !== action.payload
      );
    });
    builder.addCase(deleteEvent.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to delete event";
    });
  },
});

export const { clearEventError } = eventSlice.actions;
export default eventSlice.reducer;
