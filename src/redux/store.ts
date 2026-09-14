import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import groupReducer from "@/redux/slices/admin/groupSlice";
import permissionReducer from "@/redux/slices/admin/permissionSlice";
import groupAccessReducer from "@/redux/slices/admin/groupAccessSlice";
import userReducer from "./slices/admin/userSlice";
import eventReducer from "./slices/admin/eventSlice";
import activityReducer from "./slices/admin/activitySlice";
import ticketReducer from "./slices/admin/ticketSlice";
import bookingReducer from "./slices/admin/bookingSlice";
import attendeeReducer from "./slices/admin/attendeeSlice";
import transactionReducer from "./slices/admin/transactionSlice";
import frontendEventReducer from "./slices/frontEnd/eventSlice";
import frontendUserReducer from "./slices/frontEnd/userSlice";
import frontendCheckoutReducer from "./slices/frontEnd/checkoutSlice";
import frontendBookingReducer from "./slices/frontEnd/bookingSlice";
import frontendTransactionReducer from "./slices/frontEnd/transactionSlice";
import frontendMembershipReducer from "./slices/frontEnd/membershipSlice";
import adminMembershipReducer from "./slices/admin/membershipSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    groups: groupReducer,
    permissions: permissionReducer,
    groupAccess: groupAccessReducer,
    users: userReducer,
    events: eventReducer,
    activities: activityReducer,
    tickets: ticketReducer,
    bookings: bookingReducer,
    attendees: attendeeReducer,
    transactions: transactionReducer,
    frontendEvents: frontendEventReducer,
    frontendUser: frontendUserReducer,
    frontendCheckout: frontendCheckoutReducer,
    frontendBooking: frontendBookingReducer,
    frontendTransaction: frontendTransactionReducer,
    frontendMembership: frontendMembershipReducer,
    adminMembership: adminMembershipReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
