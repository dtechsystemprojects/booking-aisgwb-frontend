import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ActivityRecord {
  id: string;
  user_id: string; // or populate user
  user?: any;
  module_name: string;
  module_id: string;
  action: string;
  description: Record<string, any>;
  ip: string;
  createdAt: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ActivityState {
  activities: ActivityRecord[];
  pagination?: PaginationInfo;
  loading: boolean;
  error: string | null;
}

const initialState: ActivityState = {
  activities: [],
  loading: false,
  error: null,
};

export const fetchActivities = createAsyncThunk<
  ActivityRecord[],
  void,
  { rejectValue: string }
>("activities/fetchActivities", async (_, { rejectWithValue }) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || sessionStorage.getItem("token") : null;
    const res = await fetch(`${API_BASE_URL}/admin/activities?limit=10000`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error("Failed to fetch activities");
    const json = await res.json();
    if (json.success && json.data) {
      return json.data.map((item: any) => ({ ...item, id: item._id || item.id }));
    }
    return rejectWithValue("Invalid data received");
  } catch (error: any) {
    return rejectWithValue(error.message || "Error fetching activities");
  }
});

export const deleteActivity = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("activities/deleteActivity", async (id, { rejectWithValue }) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || sessionStorage.getItem("token") : null;
    const res = await fetch(`${API_BASE_URL}/admin/activities/${id}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error("Failed to delete activity");
    const json = await res.json();
    if (json.success) {
      return id;
    }
    return rejectWithValue(json.message || "Failed to delete activity");
  } catch (error: any) {
    return rejectWithValue(error.message || "Error deleting activity");
  }
});

const activitySlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    clearActivityError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchActivities.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchActivities.fulfilled, (state, action) => {
      state.loading = false;
      state.activities = action.payload;
    });
    builder.addCase(fetchActivities.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch activities";
    });

    // Delete
    builder.addCase(deleteActivity.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteActivity.fulfilled, (state, action) => {
      state.loading = false;
      state.activities = state.activities.filter((a) => a.id !== action.payload);
    });
    builder.addCase(deleteActivity.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to delete activity";
    });
  },
});

export const { clearActivityError } = activitySlice.actions;
export default activitySlice.reducer;
