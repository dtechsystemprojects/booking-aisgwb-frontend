import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { UserInfo } from "../authSlice"; // Reusing the UserInfo interface

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface FrontendGroup {
  id: string;
  name: string;
}

export interface FrontendAuthState {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  groups: FrontendGroup[];
}

const getInitialToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("frontend_token") || sessionStorage.getItem("frontend_token") || null;
  }
  return null;
};

const getInitialUser = () => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("frontend_user") || sessionStorage.getItem("frontend_user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {}
    }
  }
  return null;
};

const initialState: FrontendAuthState = {
  user: getInitialUser(),
  token: getInitialToken(),
  isAuthenticated: Boolean(getInitialToken()),
  loading: false,
  error: null,
  groups: [],
};

export const frontendLoginSendOtp = createAsyncThunk(
  "frontendUser/loginSendOtp",
  async (
    payload: { email: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        let errorMessage = data.message || data.error || "Failed to send OTP.";
        if (data.errors && typeof data.errors === "object") {
          let messages: string[] = [];
          if (Array.isArray(data.errors)) {
            messages = data.errors.map((e: any) => e.msg || e.message || JSON.stringify(e));
          } else {
            messages = Object.values(data.errors).flat().map((e: any) => 
              typeof e === 'object' ? (e.msg || e.message || JSON.stringify(e)) : String(e)
            );
          }
          const validationMessages = messages.filter(Boolean).join(", ");
          if (validationMessages) errorMessage = validationMessages;
        }
        return rejectWithValue(errorMessage);
      }
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error occurred");
    }
  }
);

export const frontendVerifyLoginOtp = createAsyncThunk(
  "frontendUser/verifyLoginOtp",
  async (
    payload: { email: string; otp: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        let errorMessage = data.message || data.error || "Authentication failed.";
        if (data.errors && typeof data.errors === "object") {
          let messages: string[] = [];
          if (Array.isArray(data.errors)) {
            messages = data.errors.map((e: any) => e.msg || e.message || JSON.stringify(e));
          } else {
            messages = Object.values(data.errors).flat().map((e: any) => 
              typeof e === 'object' ? (e.msg || e.message || JSON.stringify(e)) : String(e)
            );
          }
          const validationMessages = messages.filter(Boolean).join(", ");
          if (validationMessages) errorMessage = validationMessages;
        }
        return rejectWithValue(errorMessage);
      }
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error occurred");
    }
  }
);

export const frontendSendOtp = createAsyncThunk(
  "frontendUser/sendOtp",
  async (
    userData: {
      name: string;
      groupId: string;
      sex: string;
      email: string;
      mobile: string;
      username: string;
      password?: string;
      [key: string]: any;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok) {
        let errorMessage = data.message || data.error || "Failed to send OTP.";
        if (data.errors && typeof data.errors === "object") {
          let messages: string[] = [];
          if (Array.isArray(data.errors)) {
            messages = data.errors.map((e: any) => e.msg || e.message || JSON.stringify(e));
          } else {
            messages = Object.values(data.errors).flat().map((e: any) => 
              typeof e === 'object' ? (e.msg || e.message || JSON.stringify(e)) : String(e)
            );
          }
          const validationMessages = messages.filter(Boolean).join(", ");
          if (validationMessages) errorMessage = validationMessages;
        }
        return rejectWithValue(errorMessage);
      }
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error occurred");
    }
  }
);

export const frontendVerifyRegistrationOtp = createAsyncThunk(
  "frontendUser/verifyOtp",
  async (
    payload: { email: string; otp: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        let errorMessage = data.message || data.error || "Registration failed.";
        if (data.errors && typeof data.errors === "object") {
          let messages: string[] = [];
          if (Array.isArray(data.errors)) {
            messages = data.errors.map((e: any) => e.msg || e.message || JSON.stringify(e));
          } else {
            messages = Object.values(data.errors).flat().map((e: any) => 
              typeof e === 'object' ? (e.msg || e.message || JSON.stringify(e)) : String(e)
            );
          }
          const validationMessages = messages.filter(Boolean).join(", ");
          if (validationMessages) errorMessage = validationMessages;
        }
        return rejectWithValue(errorMessage);
      }
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error occurred");
    }
  }
);

export const frontendLogout = createAsyncThunk(
  "frontendUser/logout",
  async (_, { rejectWithValue }) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("frontend_token") || localStorage.getItem("token") : null;
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || data.message || "Logout failed");
      }
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error occurred");
    }
  }
);

export const fetchFrontendProfile = createAsyncThunk(
  "frontendUser/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("frontend_token") || localStorage.getItem("token") : null;
      const response = await fetch(`${API_BASE_URL}/login/profile`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || data.message || "Failed to fetch profile");
      }
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error fetching profile");
    }
  }
);

export const updateFrontendProfile = createAsyncThunk(
  "frontendUser/updateProfile",
  async (profileData: any, { rejectWithValue }) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("frontend_token") || localStorage.getItem("token") : null;
      const response = await fetch(`${API_BASE_URL}/login/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(profileData),
      });
      const data = await response.json();
      if (!response.ok) {
        let errorMessage = data.message || data.error || "Failed to update profile";
        if (data.errors && typeof data.errors === "object") {
          const messages = Array.isArray(data.errors)
            ? data.errors.map((e: any) => e.msg || e.message || JSON.stringify(e))
            : Object.values(data.errors).flat().map((e: any) => typeof e === "object" ? e.msg || e.message : String(e));
          if (messages.length > 0) errorMessage = messages.join(", ");
        }
        return rejectWithValue(errorMessage);
      }
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error updating profile");
    }
  }
);

export const fetchFrontendGroups = createAsyncThunk(
  "frontendUser/getGroups",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register/getGroups`);
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || data.error || "Failed to fetch groups");
      }
      if (data.success && data.data) {
        return data.data;
      } else if (Array.isArray(data)) {
        return data;
      }
      return [];
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error fetching groups");
    }
  }
);

const userSlice = createSlice({
  name: "frontendUser",
  initialState,
  reducers: {
    clearFrontendAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login (Send OTP)
    builder.addCase(frontendLoginSendOtp.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(frontendLoginSendOtp.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
    });
    builder.addCase(frontendLoginSendOtp.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Failed to send OTP";
    });

    // Verify Login OTP
    builder.addCase(frontendVerifyLoginOtp.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(frontendVerifyLoginOtp.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      
      const data = action.payload;
      let userData = data.data?.user || data.user;
      if (!userData && data.id) {
        userData = { ...data };
        delete userData.token;
      }
      if (userData) {
        userData.isFrontEnd = true;
      } else {
        userData = { isFrontEnd: true };
      }

      const token = data.data?.token || data.token || "";

      state.user = userData;
      state.token = token;
      state.error = null;

      if (typeof window !== "undefined") {
        if (token) {
          localStorage.setItem("frontend_token", token);
          localStorage.setItem("token", token);
          document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        }
        if (userData) {
          localStorage.setItem("frontend_user", JSON.stringify(userData));
          localStorage.setItem("user", JSON.stringify(userData));
        }
      }
    });
    builder.addCase(frontendVerifyLoginOtp.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Authentication failed";
    });

    // Register (Send OTP)
    builder.addCase(frontendSendOtp.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(frontendSendOtp.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
    });
    builder.addCase(frontendSendOtp.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Failed to send OTP";
    });

    // Verify OTP & Complete Registration
    builder.addCase(frontendVerifyRegistrationOtp.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(frontendVerifyRegistrationOtp.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      
      const data = action.payload;
      let userData = data.data?.user || data.user;
      if (!userData && data.id) {
        userData = { ...data };
        delete userData.token;
      }
      if (userData) {
        userData.isFrontEnd = true;
      } else {
        userData = { isFrontEnd: true };
      }

      const token = data.data?.token || data.token || "";

      state.user = userData;
      state.token = token;
      state.error = null;

      if (typeof window !== "undefined") {
        if (token) {
          localStorage.setItem("frontend_token", token);
          localStorage.setItem("token", token);
          document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        }
        if (userData) {
          localStorage.setItem("frontend_user", JSON.stringify(userData));
          localStorage.setItem("user", JSON.stringify(userData));
        }
      }
    });
    builder.addCase(frontendVerifyRegistrationOtp.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Registration failed";
    });

    // Logout
    builder.addCase(frontendLogout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("frontend_token");
        localStorage.removeItem("frontend_user");
        sessionStorage.removeItem("frontend_token");
        sessionStorage.removeItem("frontend_user");
        document.cookie = "user=; path=/; max-age=0; SameSite=Lax";
        // Do not delete "token" cookie entirely if we want admin to remain logged in, but for safety, frontend logout clears it:
        document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
      }
    });

    // Fetch Profile
    builder.addCase(fetchFrontendProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFrontendProfile.fulfilled, (state, action) => {
      state.loading = false;
      const data = action.payload;
      const userData = data.data?.user || data.user;
      if (userData) {
        userData.isFrontEnd = true;
        state.user = userData;
        if (typeof window !== "undefined") {
          localStorage.setItem("frontend_user", JSON.stringify(userData));
          localStorage.setItem("user", JSON.stringify(userData));
          document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        }
      }
    });
    builder.addCase(fetchFrontendProfile.rejected, (state, action) => {
      state.loading = false;
      // Do not unset user if fetch fails due to network, but if unauthorized, that's handled differently usually
      state.error = (action.payload as string) || "Failed to fetch profile";
    });

    // Update Profile
    builder.addCase(updateFrontendProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateFrontendProfile.fulfilled, (state, action) => {
      state.loading = false;
      const data = action.payload;
      const userData = data.data?.user || data.user;
      const token = data.data?.token || data.token;
      
      if (token) {
        state.token = token;
        if (typeof window !== "undefined") {
          localStorage.setItem("frontend_token", token);
          localStorage.setItem("token", token);
          document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        }
      }

      if (userData) {
        userData.isFrontEnd = true;
        state.user = userData;
        if (typeof window !== "undefined") {
          localStorage.setItem("frontend_user", JSON.stringify(userData));
          localStorage.setItem("user", JSON.stringify(userData));
          document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        }
      } else if (state.user) {
        const updatedUser = { ...state.user, ...action.meta.arg, isFrontEnd: true };
        state.user = updatedUser;
        if (typeof window !== "undefined") {
          localStorage.setItem("frontend_user", JSON.stringify(updatedUser));
          localStorage.setItem("user", JSON.stringify(updatedUser));
          document.cookie = `user=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        }
      }
    });
    builder.addCase(updateFrontendProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Failed to update profile";
    });

    // Fetch Groups
    builder.addCase(fetchFrontendGroups.fulfilled, (state, action) => {
      state.groups = action.payload;
    });
  },
});

export const { clearFrontendAuthError } = userSlice.actions;
export default userSlice.reducer;
