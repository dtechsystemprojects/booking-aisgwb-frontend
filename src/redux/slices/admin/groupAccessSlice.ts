import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  PermissionModuleAccess,
  initialModulePermissions,
} from "@/app/admin/dataStore";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface GroupAccessState {
  modules: PermissionModuleAccess[];
  loading: boolean;
  error: string | null;
}

const initialState: GroupAccessState = {
  modules: [],
  loading: false,
  error: null,
};

// Fetch all access rules for a given group ID
export const fetchGroupAccessRules = createAsyncThunk<
  PermissionModuleAccess[],
  string,
  { rejectValue: string }
>("groupAccess/fetchGroupAccessRules", async (groupId, { rejectWithValue }) => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null;
    const res = await fetch(
      `${API_BASE_URL}/admin/groups/${encodeURIComponent(groupId)}/access-rules`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );
    if (!res.ok) throw new Error("Failed to fetch group access rules");
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return rejectWithValue(json.message || "Failed to fetch rules");
  } catch (error: any) {
    return rejectWithValue(
      error.message || "Error fetching group access rules",
    );
  }
});

export const addGroupAccessRule = createAsyncThunk<
  PermissionModuleAccess,
  { groupId: string; rule: PermissionModuleAccess },
  { rejectValue: string }
>(
  "groupAccess/addGroupAccessRule",
  async ({ groupId, rule }, { rejectWithValue }) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || sessionStorage.getItem("token")
          : null;
      const res = await fetch(
        `${API_BASE_URL}/admin/groups/${encodeURIComponent(groupId)}/access-rules`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(rule),
        },
      );
      if (!res.ok) throw new Error("Failed to create group access rule");
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
      return rejectWithValue(
        json.message || "Failed to create group access rule",
      );
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Error creating group access rule",
      );
    }
  },
);

export const updateGroupAccessRule = createAsyncThunk<
  PermissionModuleAccess,
  { groupId: string; rule: PermissionModuleAccess },
  { rejectValue: string }
>(
  "groupAccess/updateGroupAccessRule",
  async ({ groupId, rule }, { rejectWithValue }) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || sessionStorage.getItem("token")
          : null;
      const res = await fetch(
        `${API_BASE_URL}/admin/groups/${encodeURIComponent(groupId)}/access-rules/${encodeURIComponent(rule.id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(rule),
        },
      );
      if (!res.ok) throw new Error("Failed to update group access rule");
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
      return rejectWithValue(
        json.message || "Failed to update group access rule",
      );
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Error updating group access rule",
      );
    }
  },
);

export const bulkSaveGroupAccessRules = createAsyncThunk<
  PermissionModuleAccess[],
  { groupId: string; rules: PermissionModuleAccess[] },
  { rejectValue: string }
>(
  "groupAccess/bulkSaveGroupAccessRules",
  async ({ groupId, rules }, { rejectWithValue }) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || sessionStorage.getItem("token")
          : null;
      const res = await fetch(
        `${API_BASE_URL}/admin/groups/${encodeURIComponent(groupId)}/access-rules/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(rules),
        },
      );
      if (!res.ok) throw new Error("Failed to save group access policy");
      const json = await res.json();
      if (json.success) {
        return rules;
      }
      return rejectWithValue(json.message || "Failed to save policy");
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Error saving group access policy",
      );
    }
  },
);

export const deleteGroupAccessRule = createAsyncThunk<
  string,
  { groupId: string; ruleId: string },
  { rejectValue: string }
>(
  "groupAccess/deleteGroupAccessRule",
  async ({ groupId, ruleId }, { rejectWithValue }) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || sessionStorage.getItem("token")
          : null;
      const res = await fetch(
        `${API_BASE_URL}/admin/groups/${encodeURIComponent(groupId)}/access-rules/${encodeURIComponent(ruleId)}`,
        {
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );
      if (!res.ok) throw new Error("Failed to delete group access rule");
      const json = await res.json();
      if (json.success) {
        return ruleId;
      }
      return rejectWithValue(
        json.message || "Failed to delete group access rule",
      );
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Error deleting group access rule",
      );
    }
  },
);

const groupAccessSlice = createSlice({
  name: "groupAccess",
  initialState,
  reducers: {
    clearGroupAccessError: (state) => {
      state.error = null;
    },
    // Useful for optimistic updates locally when not fetching from server
    setModulesOptimistic: (
      state,
      action: PayloadAction<PermissionModuleAccess[]>,
    ) => {
      state.modules = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchGroupAccessRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroupAccessRules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload;
      })
      .addCase(fetchGroupAccessRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load access rules";
      })
      // Add
      .addCase(addGroupAccessRule.fulfilled, (state, action) => {
        state.modules.push(action.payload);
      })
      .addCase(addGroupAccessRule.rejected, (state, action) => {
        state.error = action.payload || "Failed to add access rule";
      })
      // Update
      .addCase(updateGroupAccessRule.fulfilled, (state, action) => {
        const index = state.modules.findIndex(
          (m) => m.id === action.payload.id,
        );
        if (index !== -1) {
          state.modules[index] = action.payload;
        }
      })
      .addCase(updateGroupAccessRule.rejected, (state, action) => {
        state.error = action.payload || "Failed to update access rule";
      })
      // Delete
      .addCase(deleteGroupAccessRule.fulfilled, (state, action) => {
        state.modules = state.modules.filter((m) => m.id !== action.payload);
      })
      .addCase(deleteGroupAccessRule.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete access rule";
      })
      // Bulk Save
      .addCase(bulkSaveGroupAccessRules.fulfilled, (state, action) => {
        state.modules = action.payload;
      })
      .addCase(bulkSaveGroupAccessRules.rejected, (state, action) => {
        state.error = action.payload || "Failed to bulk save access rules";
      });
  },
});

export const { clearGroupAccessError, setModulesOptimistic } =
  groupAccessSlice.actions;
export default groupAccessSlice.reducer;
