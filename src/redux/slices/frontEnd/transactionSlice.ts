import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface TransactionState {
  transactions: any[];
  loading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  transactions: [],
  loading: false,
  error: null,
};

export const fetchFrontendTransactions = createAsyncThunk(
  "frontendTransaction/fetchTransactions",
  async (_, { rejectWithValue }) => {
    try {
      let token = null;
      if (typeof window !== "undefined") {
        token = localStorage.getItem("token");
      }

      const response = await fetch(`${API_BASE_URL}/transactions/my-transactions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || data.error || "Failed to fetch transactions");
      }
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error occurred");
    }
  }
);

export const exportFrontendTransactions = createAsyncThunk(
  "frontendTransaction/exportTransactions",
  async (_, { rejectWithValue }) => {
    try {
      let token = null;
      if (typeof window !== "undefined") {
        token = localStorage.getItem("token");
      }

      const response = await fetch(`${API_BASE_URL}/transactions/transactionExport`, {
        method: "GET",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return rejectWithValue(data.message || data.error || "Failed to export transactions");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Transactions_Statement_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error occurred");
    }
  }
);

const transactionSlice = createSlice({
  name: "frontendTransaction",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchFrontendTransactions.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFrontendTransactions.fulfilled, (state, action) => {
      state.loading = false;
      state.transactions = action.payload || [];
    });
    builder.addCase(fetchFrontendTransactions.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Failed to fetch transactions";
    });
  },
});

export default transactionSlice.reducer;
