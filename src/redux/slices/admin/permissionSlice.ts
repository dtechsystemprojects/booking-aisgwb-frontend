import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  ManagementType,
  permissionManagementData,
} from "@/app/admin/groups/permissions/components/data";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface PermissionState {
  permissions: ManagementType[];
  loading: boolean;
  error: string | null;
}

const initialState: PermissionState = {
  permissions: [],
  loading: false,
  error: null,
};

export const fetchPermissions = createAsyncThunk<
  ManagementType[],
  void,
  { rejectValue: string }
>("permissions/fetchPermissions", async (_, { rejectWithValue }) => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null;
    const res = await fetch(`${API_BASE_URL}/admin/permissions`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error("Failed to fetch permissions");
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return rejectWithValue("Invalid data received");
  } catch (error: any) {
    return rejectWithValue(error.message || "Error fetching permissions");
  }
});

export const addPermission = createAsyncThunk<
  ManagementType,
  ManagementType,
  { rejectValue: string }
>("permissions/addPermission", async (record, { rejectWithValue }) => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null;
    const res = await fetch(`${API_BASE_URL}/admin/permissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(record),
    });
    const json = await res.json();
    if (!res.ok) {
      const errorMsg =
        json.errors && json.errors.length > 0
          ? json.errors[0].message
          : json.message;
      return rejectWithValue(errorMsg || "Failed to add permission");
    }
    if (json.success && json.data) {
      return json.data;
    }
    return rejectWithValue(json.message || "Failed to add permission");
  } catch (error: any) {
    return rejectWithValue(error.message || "Error adding permission");
  }
});

export const updatePermission = createAsyncThunk<
  ManagementType,
  ManagementType,
  { rejectValue: string }
>("permissions/updatePermission", async (record, { rejectWithValue }) => {
  try {
    const id = record.id || record.name; // fallback to name if id is missing for mock api purposes
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null;
    const res = await fetch(
      `${API_BASE_URL}/admin/permissions/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(record),
      },
    );
    const json = await res.json();
    if (!res.ok) {
      const errorMsg =
        json.errors && json.errors.length > 0
          ? json.errors[0].message
          : json.message;
      return rejectWithValue(errorMsg || "Failed to update permission");
    }
    if (json.success && json.data) {
      return json.data;
    }
    return rejectWithValue(json.message || "Failed to update permission");
  } catch (error: any) {
    return rejectWithValue(error.message || "Error updating permission");
  }
});

export const deletePermission = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("permissions/deletePermission", async (id, { rejectWithValue }) => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null;
    const res = await fetch(
      `${API_BASE_URL}/admin/permissions/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );
    if (!res.ok) throw new Error("Failed to delete permission");
    const json = await res.json();
    if (json.success) {
      return id;
    }
    return rejectWithValue(json.message || "Failed to delete permission");
  } catch (error: any) {
    return rejectWithValue(error.message || "Error deleting permission");
  }
});

const permissionSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {
    clearPermissionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load permissions";
      })
      // Add
      .addCase(addPermission.fulfilled, (state, action) => {
        state.permissions.unshift(action.payload);
      })
      .addCase(addPermission.rejected, (state, action) => {
        state.error = action.payload || "Failed to add permission";
      })
      // Update
      .addCase(updatePermission.fulfilled, (state, action) => {
        const index = state.permissions.findIndex(
          (p) =>
            (p.id && p.id === action.payload.id) ||
            p.name === action.payload.name,
        );
        if (index !== -1) {
          state.permissions[index] = action.payload;
        }
      })
      .addCase(updatePermission.rejected, (state, action) => {
        state.error = action.payload || "Failed to update permission";
      })
      // Delete
      .addCase(deletePermission.fulfilled, (state, action) => {
        state.permissions = state.permissions.filter(
          (p) => p.id !== action.payload && p.name !== action.payload,
        );
      })
      .addCase(deletePermission.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete permission";
      });
  },
});

export const { clearPermissionError } = permissionSlice.actions;
export default permissionSlice.reducer;
