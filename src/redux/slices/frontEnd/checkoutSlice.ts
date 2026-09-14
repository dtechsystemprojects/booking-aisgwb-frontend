import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface CheckoutItem {
  eventId: string;
  ticketId: string;
  quantity: number;
  price: number;
  name: string;
}

export interface CheckoutState {
  items: CheckoutItem[];
  totalAmount: number;
  loading: boolean;
  error: string | null;
  status: "idle" | "loading" | "success" | "failed";
}

const initialState: CheckoutState = {
  items: [],
  totalAmount: 0,
  loading: false,
  error: null,
  status: "idle",
};

export const createCheckoutOrder = createAsyncThunk(
  "frontendCheckout/createOrder",
  async (
    orderData: { amount: number; key_id: string; key_secret: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/checkout/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(
          data.message || data.error?.description || data.error?.message || "Failed to initialize payment order on the server."
        );
      }
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error occurred while creating order");
    }
  }
);

export const verifyCheckoutPayment = createAsyncThunk(
  "frontendCheckout/verifyPayment",
  async (
    verifyData: any,
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/checkout/verify-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(verifyData),
      });

      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Payment verification failed.");
      }
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error occurred during verification");
    }
  }
);

const checkoutSlice = createSlice({
  name: "frontendCheckout",
  initialState,
  reducers: {
    addItemToCart: (state, action) => {
      const existingItem = state.items.find(
        (item) => item.ticketId === action.payload.ticketId
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    },
    removeItemFromCart: (state, action) => {
      state.items = state.items.filter(
        (item) => item.ticketId !== action.payload
      );
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    },
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createCheckoutOrder.pending, (state) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(createCheckoutOrder.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(createCheckoutOrder.rejected, (state, action) => {
      state.loading = false;
      state.status = "failed";
      state.error = (action.payload as string) || "Order creation failed";
    });

    builder.addCase(verifyCheckoutPayment.pending, (state) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(verifyCheckoutPayment.fulfilled, (state) => {
      state.loading = false;
      state.status = "success";
      // Clear cart on successful checkout
      state.items = [];
      state.totalAmount = 0;
    });
    builder.addCase(verifyCheckoutPayment.rejected, (state, action) => {
      state.loading = false;
      state.status = "failed";
      state.error = (action.payload as string) || "Payment verification failed";
    });
  },
});

export const { addItemToCart, removeItemFromCart, clearCart } = checkoutSlice.actions;
export default checkoutSlice.reducer;
