import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { UserRecord } from "@/app/admin/dataStore";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UserState {
  users: UserRecord[];
  pagination?: PaginationInfo;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk<
  UserRecord[],
  void,
  { rejectValue: string }
>("users/fetchUsers", async (_, { rejectWithValue }) => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null;
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return rejectWithValue("Invalid data received");
  } catch (error: any) {
    return rejectWithValue(error.message || "Error fetching users");
  }
});

export const addUser = createAsyncThunk<
  UserRecord,
  UserRecord,
  { rejectValue: any }
>("users/addUser", async (record, { rejectWithValue }) => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null;
        
    const payload: any = { ...record };
    
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return rejectWithValue(json);
    }
    
    return json.data;
  } catch (error: any) {
    return rejectWithValue(error.message || "Error adding user");
  }
});

export const updateUser = createAsyncThunk<
  UserRecord,
  UserRecord,
  { rejectValue: any }
>("users/updateUser", async (record, { rejectWithValue }) => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null;
        
    const payload: any = { ...record };
    
    const res = await fetch(`${API_BASE_URL}/admin/users/${record.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return rejectWithValue(json);
    }
    
    return json.data;
  } catch (error: any) {
    return rejectWithValue(error.message || "Error updating user");
  }
});

export const deleteUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("users/deleteUser", async (id, { rejectWithValue }) => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null;
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error("Failed to delete user");
    const json = await res.json();
    if (json.success) {
      return id;
    }
    return rejectWithValue(json.message || "Failed to delete user");
  } catch (error: any) {
    return rejectWithValue(error.message || "Error deleting user");
  }
});

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUserError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchUsers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.loading = false;
      state.users = action.payload;
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch users";
    });

    // Add
    builder.addCase(addUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addUser.fulfilled, (state, action) => {
      state.loading = false;
      state.users.push(action.payload);
    });
    builder.addCase(addUser.rejected, (state, action) => {
      state.loading = false;
      if (typeof action.payload === "object" && action.payload?.errors) {
        state.error = null; // Component will handle field validation errors
      } else {
        state.error =
          action.payload?.message || action.payload || "Failed to add user";
      }
    });

    // Update
    builder.addCase(updateUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateUser.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.users.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    });
    builder.addCase(updateUser.rejected, (state, action) => {
      state.loading = false;
      if (typeof action.payload === "object" && action.payload?.errors) {
        state.error = null; // Component will handle field validation errors
      } else {
        state.error =
          action.payload?.message || action.payload || "Failed to update user";
      }
    });

    // Delete
    builder.addCase(deleteUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.loading = false;
      state.users = state.users.filter((u) => u.id !== action.payload);
    });
    builder.addCase(deleteUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to delete user";
    });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
