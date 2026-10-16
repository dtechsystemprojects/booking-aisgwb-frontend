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
  const { checked, isAuthenticated, user } = useAppSelector(
    (state) => state.auth,
  );
  const { isAuthenticated: frontendIsAuthenticated, user: frontendUser } = useAppSelector(
    (state) => state.frontendUser,
  );
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasToken =
    typeof window !== "undefined" &&
    Boolean(
      localStorage.getItem("token") ||
        localStorage.getItem("frontend_token") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("frontend_token")
    );

  const isUserAuthenticated = Boolean(
    isAuthenticated || frontendIsAuthenticated || hasToken
  );

  useEffect(() => {
    if (!mounted) return;

    if (requireAuth) {
      if (!hasToken || (checked && !isAuthenticated && !frontendIsAuthenticated)) {
        router.replace("/login");
      }
    } else {
      if (isUserAuthenticated) {
        router.replace("/profile");
      }
    }
  }, [
    mounted,
    checked,
    isAuthenticated,
    frontendIsAuthenticated,
    hasToken,
    isUserAuthenticated,
    requireAuth,
    router,
  ]);

  if (!mounted) return null;

  if (requireAuth) {
    if (!hasToken || (checked && !isAuthenticated && !frontendIsAuthenticated)) {
      return null;
    }
    if (!checked && !isUserAuthenticated) {
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
  }

  if (!requireAuth && isUserAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default FrontendProtectedRoute;

