import React from 'react';
import type { Metadata } from "next";
import Footer from "../common/Footer";
import Header from "../common/Header";
import CheckoutClient from './components/CheckoutClient';
import FrontendProtectedRoute from "@/components/FrontendProtectedRoute";

export const metadata: Metadata = { 
    title: "Checkout | AISGWB Events" 
};

const CheckoutPage = () => {
    return (
        <FrontendProtectedRoute requireAuth={true}>
            <div className="bg-body-secondary min-vh-100 d-flex flex-column">
                <Header />
                <CheckoutClient />
                <Footer />
            </div>
        </FrontendProtectedRoute>
    );
};

export default CheckoutPage;
