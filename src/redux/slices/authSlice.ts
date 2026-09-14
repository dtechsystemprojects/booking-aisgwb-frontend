import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface UserInfo {
  _id?: string;
  id?: string;
  fullName?: string;
  name?: string;
  username?: string;
  email?: string;
  memberId?: string;
  groupId?: string;
  groupName?: string;
  status: "Active" | "Inactive";
  accessRules?: any[];
  isFrontEnd?: boolean;
  avatar?: string;
  profileImage?: string;
  image?: string;
  profilePic?: string;
  membership?: {
    status: string;
    [key: string]: any;
  };
  mobile?: string;
  phone?: string;
}

export interface AuthState {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  checked: boolean;
}

const getInitialToken = () => {
  if (typeof window !== "undefined") {
    return (
      localStorage.getItem("token") || sessionStorage.getItem("token") || null
    );
  }
  return null;
};

const getInitialUser = () => {
  if (typeof window !== "undefined") {
    let userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    let cookieUserStr = null;

    // Always check the cookie because frontend login stores the robust user object there
    const match = document.cookie.match(/(?:^|; )user=([^;]+)/);
    if (match) {
      try {
        cookieUserStr = decodeURIComponent(match[1]);
      } catch (e) {}
    }

    // Prioritize cookie over local storage, or merge them
    if (cookieUserStr) {
      try {
        const parsedCookie = JSON.parse(cookieUserStr);
        if (parsedCookie && parsedCookie.isFrontEnd) {
          // It's definitely a frontend user, override whatever is in localStorage
          localStorage.setItem("user", cookieUserStr);
          return parsedCookie;
        }
      } catch (e) {}
    }

    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {}
    }
  }
  return null;
};

const initialToken = getInitialToken();
const initialUser = getInitialUser();

const initialState: AuthState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: Boolean(initialToken),
  loading: false,
  error: null,
  checked: false, // Force checkAuth on app load to get fresh permissions
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    credentials: {
      username?: string;
      email?: string;
      password?: string;
      credential?: string;
      isOtpAuth?: boolean;
      [key: string]: any;
    },
    { rejectWithValue },
  ) => {
    try {
      const identifierVal =
        credentials.username ||
        credentials.identifier ||
        credentials.email ||
        "";
      const payload = {
        username: identifierVal,
        password: credentials.password || credentials.credential || "",
      };
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || data.message || "Login failed");
      }
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.message ||
          "Network error occurred while connecting to authentication server",
      );
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || sessionStorage.getItem("token")
          : null;
      const response = await fetch(`${API_URL}/auth/logout`, {
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
  },
);

const decodeJwt = (token: string): any => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch (e) {
    return null;
  }
};

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || sessionStorage.getItem("token")
          : null;
      if (!token) {
        return rejectWithValue("No token found");
      }
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401 || response.status === 403) {
        const data = await response.json().catch(() => ({}));
        return rejectWithValue(
          data.error || data.message || "Token invalid or expired",
        );
      }
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      // If /auth/me returns 404/500/network issues, verify token expiration locally
      try {
        const decoded = decodeJwt(token);
        if (decoded && typeof decoded === "object") {
          const now = Math.floor(Date.now() / 1000);
          if (!decoded.exp || decoded.exp > now) {
            const storedUser =
              typeof window !== "undefined"
                ? localStorage.getItem("user") || sessionStorage.getItem("user")
                : null;
            const userObj = storedUser
              ? JSON.parse(storedUser)
              : {
                  name: decoded.name || "User",
                  email: decoded.email,
                };
            return { success: true, data: { token, user: userObj } };
          }
        } else if (token.length > 10) {
          return {
            success: true,
            data: { token, user: { name: "User" } },
          };
        }
      } catch (e) {}
      return rejectWithValue("Not authenticated");
    } catch (err: any) {
      // On network failure, if token exists and is valid locally, keep user logged in
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || sessionStorage.getItem("token")
          : null;
      if (token) {
        try {
          const decoded = decodeJwt(token);
          if (decoded && typeof decoded === "object") {
            const now = Math.floor(Date.now() / 1000);
            if (!decoded.exp || decoded.exp > now) {
              const storedUser =
                typeof window !== "undefined"
                  ? localStorage.getItem("user") ||
                    sessionStorage.getItem("user")
                  : null;
              const userObj = storedUser
                ? JSON.parse(storedUser)
                : {
                    name: decoded.name || "User",
                    email: decoded.email,
                  };
              return { success: true, data: { token, user: userObj } };
            }
          } else if (token.length > 10) {
            return {
              success: true,
              data: { token, user: { name: "User" } },
            };
          }
        } catch (e) {}
      }
      return rejectWithValue(err.message || "Network error occurred");
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (
    userData: {
      fullName: string;
      identifier: string;
      password: string;
      username?: string;
      email?: string;
      [key: string]: any;
    },
    { rejectWithValue },
  ) => {
    try {
      const payload = {
        ...userData,
        username: userData.username || userData.identifier || userData.email,
        email: userData.email || userData.identifier || userData.username,
        identifier: userData.identifier || userData.username || userData.email,
      };
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(
          data.error || data.message || "Registration failed",
        );
      }
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error occurred");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: UserInfo; token?: string }>,
    ) => {
      state.user = action.payload.user;
      if (action.payload.token) {
        state.token = action.payload.token;
        if (typeof window !== "undefined") {
          sessionStorage.setItem("token", action.payload.token);
          localStorage.setItem("token", action.payload.token);
          document.cookie = `token=${action.payload.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        }
      }
      state.isAuthenticated = true;
      state.checked = true;
      state.error = null;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.checked = true;
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("token");
        localStorage.removeItem("token");
        document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.checked = true;
        state.user =
          action.payload.data?.user ||
          action.payload.user ||
          action.payload.data ||
          action.payload;
        const tokenStr =
          action.payload.data?.token ||
          action.payload.token ||
          action.payload.accessToken ||
          "";
        state.token = tokenStr;
        state.error = null;
        if (typeof window !== "undefined") {
          if (tokenStr) {
            sessionStorage.setItem("token", tokenStr);
            localStorage.setItem("token", tokenStr);
            document.cookie = `token=${tokenStr}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          }
          if (state.user) {
            localStorage.setItem("user", JSON.stringify(state.user));
            sessionStorage.setItem("user", JSON.stringify(state.user));
          }
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Authentication failed";
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.checked = true;
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("token");
          localStorage.removeItem("token");
          sessionStorage.removeItem("user");
          localStorage.removeItem("user");
          document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
          document.cookie = "user=; path=/; max-age=0; SameSite=Lax";
        }
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.checked = true;
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("token");
          localStorage.removeItem("token");
          sessionStorage.removeItem("user");
          localStorage.removeItem("user");
          document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
          document.cookie = "user=; path=/; max-age=0; SameSite=Lax";
        }
      });

    // Check Auth
    builder
      .addCase(checkAuth.pending, (state) => {
        if (!state.checked) {
          state.loading = true;
        }
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.checked = true;
        state.isAuthenticated = true;
        const wasFrontEnd = state.user?.isFrontEnd === true;
        state.user =
          action.payload.data?.user ||
          action.payload.user ||
          action.payload.data ||
          action.payload;
        if (wasFrontEnd && state.user) {
          state.user.isFrontEnd = true;
        }
        if (typeof window !== "undefined" && state.user) {
          localStorage.setItem("user", JSON.stringify(state.user));
          sessionStorage.setItem("user", JSON.stringify(state.user));
        }
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.checked = true;
        // Clear user/token on auth failure
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
          document.cookie = "user=; path=/; max-age=0; SameSite=Lax";
        }
        state.error = action.error.message || "Failed to authenticate";
      });

    // Register User
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Registration failed";
      });
  },
});

export const { setCredentials, clearCredentials, clearError } =
  authSlice.actions;
export default authSlice.reducer;
