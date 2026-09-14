"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";

interface FrontendProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const FrontendProtectedRoute: React.FC<FrontendProtectedRouteProps> = ({
  children,
  requireAuth = true,
}) => {
  const { loading, checked, isAuthenticated, user } = useAppSelector(
    (state) => state.auth,
  );
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthReady = mounted && (checked || (!requireAuth && !isAuthenticated) || (requireAuth && isAuthenticated));

  useEffect(() => {
    if (!mounted) return;
    
    // Redirect instantly if local state says they don't belong here
    if (requireAuth && checked && !isAuthenticated) {
      router.replace("/login");
    } else if (!requireAuth && isAuthenticated) {
      router.replace("/profile");
    }
  }, [mounted, checked, isAuthenticated, requireAuth, router, user]);

  if (!mounted) return null;

  // Show spinner ONLY if we are waiting on server confirmation that is strictly required to decide what to show
  // (e.g., requireAuth is true, but we don't have local isAuthenticated yet)
  if (!checked && requireAuth && !isAuthenticated) {
    return (
      <div
        className="d-flex justify-content-center align-items-center w-100"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default FrontendProtectedRoute;
