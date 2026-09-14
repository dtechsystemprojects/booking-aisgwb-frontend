import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  UserGroupRecord,
  PermissionModuleAccess,
  initialUserGroups,
} from "@/app/admin/dataStore";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface GroupPayload extends Partial<UserGroupRecord> {
  id?: string;
  permissions?: PermissionModuleAccess[];
}

export interface GroupDetail extends UserGroupRecord {
  permissions?: PermissionModuleAccess[];
}

interface GroupState {
  groups: UserGroupRecord[];
  currentGroup: GroupDetail | null;
  loading: boolean;
  error: string | null;
}

const initialState: GroupState = {
  groups: [],
  currentGroup: null,
  loading: false,
  error: null,
};

export const fetchGroups = createAsyncThunk<
  UserGroupRecord[],
  void,
  { rejectValue: string }
>("groups/fetchGroups", async (_, { rejectWithValue }) => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null;
    const res = await fetch(`${API_BASE_URL}/admin/groups`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const json = await res.json();
    if (!res.ok) {
      return rejectWithValue(json.message || "Failed to fetch groups");
    }
    if (json.success && json.data) {
      return json.data;
    }
    return rejectWithValue("Invalid data received from server");
  } catch (error: any) {
    return rejectWithValue(error.message || "Error fetching groups");
  }
});

export const fetchGroupById = createAsyncThunk<
  GroupDetail,
  string,
  { rejectValue: string }
>("groups/fetchGroupById", async (id, { rejectWithValue }) => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null;
    const res = await fetch(`${API_BASE_URL}/admin/groups/${id}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const json = await res.json();
    if (!res.ok) {
      return rejectWithValue(json.message || "Group not found or fetch failed");
    }
    if (json.success && json.data) {
      return json.data;
    }
    return rejectWithValue("Invalid data received from server");
  } catch (error: any) {
    return rejectWithValue(error.message || "Error fetching group details");
  }
});

export const addGroup = createAsyncThunk<
  UserGroupRecord,
  GroupPayload,
  { rejectValue: string }
>("groups/addGroup", async (record, { rejectWithValue }) => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null;
    const res = await fetch(`${API_BASE_URL}/admin/groups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(record),
    });
    const json = await res.json();
    if (!res.ok) {
      return rejectWithValue(json.message || "Failed to create group");
    }
    if (json.success && json.data) {
      return json.data;
    }
    return rejectWithValue(json.message || "Failed to create group");
  } catch (error: any) {
    return rejectWithValue(error.message || "Error creating group");
  }
});

export const updateGroup = createAsyncThunk<
  UserGroupRecord,
  GroupPayload,
  { rejectValue: string }
>("groups/updateGroup", async (record, { rejectWithValue }) => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null;
    const res = await fetch(`${API_BASE_URL}/admin/groups/${record.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(record),
    });
    const json = await res.json();
    if (!res.ok) {
      return rejectWithValue(json.message || "Failed to update group");
    }
    if (json.success && json.data) {
      return json.data;
    }
    return rejectWithValue(json.message || "Failed to update group");
  } catch (error: any) {
    return rejectWithValue(error.message || "Error updating group");
  }
});

export const deleteGroup = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("groups/deleteGroup", async (id, { rejectWithValue }) => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null;
    const res = await fetch(`${API_BASE_URL}/admin/groups/${id}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message || "Failed to delete group");
    }
    return id;
  } catch (error: any) {
    return rejectWithValue(error.message || "Error deleting group");
  }
});

const groupSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    clearGroupError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Groups
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load groups";
      })
      // Fetch Group By Id
      .addCase(fetchGroupById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroupById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGroup = action.payload;
      })
      .addCase(fetchGroupById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load group details";
      })
      // Add Group
      .addCase(addGroup.fulfilled, (state, action) => {
        state.groups.unshift(action.payload);
      })
      .addCase(addGroup.rejected, (state, action) => {
        state.error = action.payload || "Failed to add group";
      })
      // Update Group
      .addCase(updateGroup.fulfilled, (state, action) => {
        const index = state.groups.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) {
          state.groups[index] = action.payload;
        }
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.error = action.payload || "Failed to update group";
      })
      // Delete Group
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.groups = state.groups.filter((g) => g.id !== action.payload);
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete group";
      });
  },
});

export const { clearGroupError } = groupSlice.actions;
export default groupSlice.reducer;
