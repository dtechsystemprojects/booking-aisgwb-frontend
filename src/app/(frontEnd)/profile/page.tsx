"use client";

import React, { useState, useEffect } from "react";
import { Icon as IconifyIcon } from "@iconify/react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { fetchFrontendBookings } from "@/redux/slices/frontEnd/bookingSlice";
import toast from "react-hot-toast";
import Header from "../common/Header";
import Footer from "../common/Footer";
import Account from "./components/Account";
import Membership from "./components/Membership";
import Booking from "./components/Booking";
import Transactions from "./components/Transactions";
import ProfileHead from "./components/ProfileHead";
import Events from "../landing/components/Events";
import { useSettingsContext } from "@/context/useSettingsContext";

import FrontendProtectedRoute from "@/components/FrontendProtectedRoute";

const MyAccountContent = () => {
  const [activeTab, setActiveTab] = useState<"account" | "membership" | "bookings" | "transactions" | "events">("account");

  const { bookings } = useSelector((state: RootState) => state.frontendBooking);
  const { user } = useSelector((state: RootState) => state.frontendUser);
  const hasMembership = !!user?.memberId;
  const dispatch = useDispatch<AppDispatch>();
  const { setting } = useSettingsContext();
  const enableEvent = setting("general.enable_event");
  
  useEffect(() => {
    dispatch(fetchFrontendBookings());
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("payment_success") === "true") {
        toast.success("Payment Successful! Your booking is confirmed.", { duration: 5000 });
        setActiveTab("bookings");
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      } else if (urlParams.get("membership_success") === "true") {
        toast.success("Membership applied successfully! Waiting for approval.", { duration: 5000 });
        setActiveTab("account");
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, []);

  return (
    <div className="bg-body-secondary min-vh-100 d-flex flex-column">
      <Header />

      <main className="container my-account-wrapper flex-grow-1">
        {/* Header Profile Summary Banner */}
        <ProfileHead />
        {enableEvent && <Events />}
        {/* Navigation Tabs */}
        <div className="account-nav-pills d-flex align-items-center justify-content-between mb-4">
          <ul className="nav nav-pills w-100 flex-column flex-sm-row">
            <li className="nav-item flex-fill">
              <button
                className={`nav-link w-100 ${activeTab === "account" ? "active" : ""}`}
                onClick={() => setActiveTab("account")}
              >
                <IconifyIcon icon="lucide:user" />
                <span>Account Details</span>
              </button>
            </li>
            {hasMembership && (
              <li className="nav-item flex-fill">
                <button
                  className={`nav-link w-100 ${activeTab === "membership" ? "active" : ""}`}
                  onClick={() => setActiveTab("membership")}
                >
                  <IconifyIcon icon="lucide:shield" />
                  <span>Membership</span>
                </button>
              </li>
            )}
            <li className="nav-item flex-fill">
              <button
                className={`nav-link w-100 ${activeTab === "bookings" ? "active" : ""}`}
                onClick={() => setActiveTab("bookings")}
              >
                <IconifyIcon icon="lucide:shopping-bag" />
                <span>Bookings ({bookings?.length || 0})</span>
              </button>
            </li>
            <li className="nav-item flex-fill">
              <button
                className={`nav-link w-100 ${activeTab === "transactions" ? "active" : ""}`}
                onClick={() => setActiveTab("transactions")}
              >
                <IconifyIcon icon="lucide:credit-card" />
                <span>Transactions</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Render Active Component */}
        {activeTab === "account" && <Account />}
        {activeTab === "membership" && hasMembership && <Membership />}
        {activeTab === "bookings" && <Booking />}
        {activeTab === "transactions" && <Transactions />}
      </main>

      <Footer />
    </div>
  );
};

const MyAccountPage = () => {
  return (
    <FrontendProtectedRoute requireAuth={true}>
      <MyAccountContent />
    </FrontendProtectedRoute>
  );
};

export default MyAccountPage;
