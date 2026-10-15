import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { EventRecord } from "@/app/admin/dataStore";
import { SignJWT } from "jose";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const generateToken = async () => {
  try {
    const secretKey =
      process.env.NEXT_PUBLIC_JWT_SECRET ||
      process.env.JWT_SECRET ||
      "secret-key-change-in-production-2026";
    const secret = new TextEncoder().encode(secretKey);

    return await new SignJWT({ source: "frontend" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(secret);
  } catch {
    return null;
  }
};

export interface TicketType {
  id: string;
  _id?: string;
  name: string;
  seatsRemaining: number;
  price: number;
  startDate?: string | null;
  startTime?: string | null;
  endDate?: string | null;
  endTime?: string | null;
  groupId?: { _id: string; [key: string]: unknown } | string | null;
}

interface FrontendEventState {
  events: EventRecord[];
  loading: boolean;
  error: string | null;
  currentEvent: EventRecord | null;
  tickets: TicketType[];
  ticketsLoading: boolean;
  ticketsError: string | null;
}

const initialState: FrontendEventState = {
  events: [],
  loading: false,
  error: null,
  currentEvent: null,
  tickets: [],
  ticketsLoading: false,
  ticketsError: null,
};

export const fetchFrontendEvents = createAsyncThunk<
  EventRecord[],
  void,
  { rejectValue: string }
>("frontendEvents/fetchEvents", async (_, { rejectWithValue }) => {
  try {
    const token =
      (typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null) || (await generateToken().catch(() => null));

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let res: Response | null = null;
    let fetchError: any = null;

    try {
      res = await fetch(`${API_BASE_URL}/events`, { headers });
    } catch (err: any) {
      fetchError = err;
    }

    if (!res || !res.ok) {
      const fallbackUrl = API_BASE_URL.includes("localhost")
        ? `https://api.aisgwb.org/api/events`
        : `http://localhost:5000/api/events`;
      try {
        const altRes = await fetch(fallbackUrl, { headers });
        if (altRes.ok) {
          res = altRes;
        }
      } catch {
        // ignore fallback failure
      }
    }

    if (!res) {
      throw fetchError || new Error("Failed to connect to events service");
    }

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Failed to fetch events (${res.status})`);
    }

    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return rejectWithValue(json.message || "Invalid data received");
  } catch (error: any) {
    return rejectWithValue(error.message || "Error fetching events");
  }
});

export const fetchFrontendEventById = createAsyncThunk<
  EventRecord,
  string,
  { rejectValue: string }
>("frontendEvents/fetchEventById", async (id, { rejectWithValue }) => {
  try {
    const token =
      (typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null) || (await generateToken().catch(() => null));

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let res: Response | null = null;
    let fetchError: any = null;

    try {
      res = await fetch(`${API_BASE_URL}/events/${id}`, { headers });
    } catch (err: any) {
      fetchError = err;
    }

    // If primary failed or threw (e.g. CORS mismatch between localhost and remote API), attempt fallback
    if (!res || !res.ok) {
      const fallbackUrl = API_BASE_URL.includes("localhost")
        ? `https://api.aisgwb.org/api/events/${id}`
        : `http://localhost:5000/api/events/${id}`;

      try {
        const altRes = await fetch(fallbackUrl, { headers });
        if (altRes.ok) {
          res = altRes;
        }
      } catch {
        // keep res or fetchError
      }
    }

    if (!res) {
      throw fetchError || new Error("Failed to connect to event service");
    }

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Failed to fetch event details (${res.status})`);
    }

    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return rejectWithValue(json.message || "Invalid data received");
  } catch (error: any) {
    return rejectWithValue(error.message || "Error fetching event details");
  }
});

export const fetchFrontendEventTickets = createAsyncThunk<
  TicketType[],
  string,
  { rejectValue: string }
>("frontendEvents/fetchEventTickets", async (eventId, { rejectWithValue }) => {
  try {
    const token =
      (typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null) || (await generateToken().catch(() => null));

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let res: Response | null = null;
    let fetchError: any = null;

    try {
      res = await fetch(`${API_BASE_URL}/events/tickets/${eventId}`, {
        headers,
      });
    } catch (err: any) {
      fetchError = err;
    }

    if (!res || !res.ok) {
      const fallbackUrl = API_BASE_URL.includes("localhost")
        ? `https://api.aisgwb.org/api/events/tickets/${eventId}`
        : `http://localhost:5000/api/events/tickets/${eventId}`;
      try {
        const altRes = await fetch(fallbackUrl, { headers });
        if (altRes.ok) {
          res = altRes;
        }
      } catch {
        // ignore
      }
    }

    if (!res) {
      throw fetchError || new Error("Failed to fetch tickets");
    }

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.message || "Failed to fetch tickets");
    }

    let validAttendees: any[] = [];
    try {
      let attendeesRes: Response | null = null;
      try {
        attendeesRes = await fetch(`${API_BASE_URL}/events/attendees`, {
          headers,
        });
      } catch {
        const fallbackUrl = API_BASE_URL.includes("localhost")
          ? `https://api.aisgwb.org/api/events/attendees`
          : `http://localhost:5000/api/events/attendees`;
        attendeesRes = await fetch(fallbackUrl, { headers }).catch(() => null);
      }

      if (attendeesRes && attendeesRes.ok) {
        const attendeesJson = await attendeesRes.json();
        const allAttendees = attendeesJson.data || [];
        validAttendees = allAttendees.filter((a: any) => {
          const aEventId = a.eventId?._id || a.eventId?.id || a.eventId;
          return (aEventId === eventId || aEventId?.toString() === eventId?.toString()) && a.ticketStatus !== "Cancelled";
        });
      }
    } catch (err) {
      console.error("Failed to fetch attendees for seat calculation", err);
    }

    const tickets = json.data || json || [];
    const mappedTickets = (Array.isArray(tickets) ? tickets : [])
      .filter((t: any) => t.isActive !== false)
      .map((t: any) => {
        const ticketId = t._id || t.id;
        const bookedCount = validAttendees.filter((a: any) => {
          const aTicketId = a.ticketId?._id || a.ticketId?.id || a.ticketId;
          const isUnderAge = a.ticketName && typeof a.ticketName === 'string' && a.ticketName.includes('(Under');
          return aTicketId === ticketId && !isUnderAge;
        }).length;

        const totalSeats = t.numberOfTickets || 0;
        const calcRemaining = Math.max(0, totalSeats - bookedCount);

        return {
          id: ticketId,
          name: t.ticketName || t.name || "",
          seatsRemaining: calcRemaining,
          price: t.ticketPrice || t.price || 0,
          startDate: t.startDate || null,
          startTime: t.startTime || null,
          endDate: t.endDate || null,
          endTime: t.endTime || null,
          groupId: t.groupId || null,
        };
      });

    return mappedTickets;
  } catch (error: any) {
    return rejectWithValue(error.message || "Error fetching tickets");
  }
});

const eventSlice = createSlice({
  name: "frontendEvents",
  initialState,
  reducers: {
    clearFrontendEventError(state) {
      state.error = null;
    },
    clearCurrentEvent(state) {
      state.currentEvent = null;
    },
  },
  extraReducers: (builder) => {
    // fetch events
    builder.addCase(fetchFrontendEvents.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFrontendEvents.fulfilled, (state, action) => {
      state.loading = false;
      state.events = action.payload;
    });
    builder.addCase(fetchFrontendEvents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch events";
    });

    // fetch single event
    builder.addCase(fetchFrontendEventById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFrontendEventById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentEvent = action.payload;
    });
    builder.addCase(fetchFrontendEventById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch event details";
    });

    // fetch tickets
    builder.addCase(fetchFrontendEventTickets.pending, (state) => {
      state.ticketsLoading = true;
      state.ticketsError = null;
    });
    builder.addCase(fetchFrontendEventTickets.fulfilled, (state, action) => {
      state.ticketsLoading = false;
      state.tickets = action.payload;
    });
    builder.addCase(fetchFrontendEventTickets.rejected, (state, action) => {
      state.ticketsLoading = false;
      state.ticketsError = action.payload || "Failed to fetch event tickets";
    });
  },
});

export const { clearFrontendEventError, clearCurrentEvent } = eventSlice.actions;
export default eventSlice.reducer;
