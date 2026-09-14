"use client";
import { LayoutProvider } from "@/context/useLayoutContext";
import { NotificationProvider } from "@/context/useNotificationContext";
import {
  SettingsProvider,
  useSettingsContext,
} from "@/context/useSettingsContext";
import { useAuth } from "@/hooks/useAuth";
import { store } from "@/redux/store";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Provider } from "react-redux";

const AppProvidersInner = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, checkSession, checked } = useAuth();
  const { setting, isLoading: settingsLoading } = useSettingsContext();

  const isMaintenanceOn =
    setting("general.maintenance") === true ||
    String(setting("general.maintenance")).toLowerCase() === "true" ||
    setting("general.maintenance") === 1 ||
    setting("general.maintenance") === "1";

  useEffect(() => {
    checkSession();
  }, [checkSession, pathname]);

  const isAuthPage =
    pathname?.startsWith("/auth") ||
    pathname === "/sign-in" ||
    pathname === "/sign-up";
  const isMaintenancePage = pathname === "/error/maintenance";
  const isFrontendUser = user?.isFrontEnd === true;
  const isAdminRoute = pathname?.startsWith("/admin");
  // All (frontEnd) routes: /, /login, /register, /profile, /events, /event-details, /lost-password, etc.
  const isFrontendRoute = !isAdminRoute && !isAuthPage && !isMaintenancePage;

  useEffect(() => {
    if (!checked) return;

    // 1. If maintenance mode is ON:
    if (isMaintenanceOn) {
      if (isMaintenancePage) return; // Already on maintenance page, stay

      // Frontend routes: ALL blocked → redirect to maintenance page
      if (isFrontendRoute) {
        // Exception: authenticated admin on "/" gets sent to dashboard
        if (isAuthenticated && !isFrontendUser && pathname === "/") {
          router.replace("/admin/dashboard");
          return;
        }
        router.replace("/error/maintenance");
        return;
      }

      // Auth routes: accessible for admin login
      if (isAuthPage) {
        if (isAuthenticated && !isFrontendUser) {
          router.replace("/admin/dashboard"); // Already logged in admin
        }
        return;
      }

      // Admin routes: accessible for admins
      if (isAdminRoute) {
        if (!isAuthenticated) {
          router.replace("/auth/sign-in");
          return;
        }
        if (isFrontendUser) {
          router.replace("/error/maintenance");
          return;
        }
        return; // Authenticated admin, allow
      }
    }

    // 2. If maintenance mode is OFF:
    if (isMaintenancePage) {
       router.replace("/");
      return;
    }

    // Standard Auth routing checks when site is ON

    if (isAuthenticated && isAdminRoute && isFrontendUser) {
      window.location.href = "/";
      return;
    }

    if (!isAuthenticated && isAdminRoute) {
      const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("postLoginRedirect", window.location.pathname + window.location.search);
      }
      router.replace(`/auth/sign-in?redirect=${currentUrl}`);
      return;
    } else if (isAuthenticated && isAuthPage) {
      if (isFrontendUser) {
        window.location.href = "/";
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        let redirectUrl = urlParams.get("redirect");
        if (!redirectUrl && typeof window !== "undefined") {
          redirectUrl = sessionStorage.getItem("postLoginRedirect");
        }
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("postLoginRedirect");
        }
        router.replace(redirectUrl || "/admin/dashboard");
      }
      return;
    }

    // 3. RBAC Route Guard
    if (
      isAuthenticated &&
      user &&
      pathname?.startsWith("/admin/") &&
      pathname !== "/admin/dashboard"
    ) {
      const accessRules = user.accessRules || [];
      // Find exact or partial match for URL (e.g. /admin/groups or /admin/groups/edit/1)
      // Sort by URL length descending to match most specific routes first
      const sortedRules = [...accessRules].sort(
        (a, b) => (b.url?.length || 0) - (a.url?.length || 0),
      );
      const matchedRule = sortedRules.find(
        (rule: any) => rule.url && pathname.startsWith(rule.url),
      );

      const isSuperAdmin = user?.groupId === "GRP-1";

      if (matchedRule && !matchedRule.read && !isSuperAdmin) {
        toast.error(
          `Access Denied: You do not have permission to access ${matchedRule.moduleName}.`,
        );
        router.replace("/admin/dashboard");
        return;
      }
    }
  }, [isAuthenticated, checked, pathname, router, isMaintenanceOn, user]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (
        sessionStorage.getItem("show_login_toast") === "true" &&
        pathname?.startsWith("/admin")
      ) {
        sessionStorage.removeItem("show_login_toast");
        toast.success("Login successful! Welcome to Admin Dashboard.");
      }
      
      if (sessionStorage.getItem("show_frontend_login_toast") === "true") {
        sessionStorage.removeItem("show_frontend_login_toast");
        toast.success("Login successful! Welcome to your Profile.");
      }
      
      if (sessionStorage.getItem("show_frontend_register_toast") === "true") {
        sessionStorage.removeItem("show_frontend_register_toast");
        toast.success("Registration successful! Welcome to your Profile.");
      }
      
      if (sessionStorage.getItem("show_frontend_logout_toast") === "true") {
        sessionStorage.removeItem("show_frontend_logout_toast");
        toast.success("Logout successful!");
      }
    }
  }, [pathname]);

  // Block unauthorized rendering before redirect completes

  let allowRender = true;
  
  // Don't render protected admin routes if we don't have a user at all (wait for checkAuth)
  if (!user && !checked && isAdminRoute) allowRender = false;
  
  // Don't render admin routes for frontend users
  if (isAuthenticated && isAdminRoute && isFrontendUser) allowRender = false;
  
  // Don't render admin routes for unauthenticated users
  if (!isAuthenticated && isAdminRoute && checked) allowRender = false;

  // Block rendering of ALL frontend routes during maintenance mode
  if (isMaintenanceOn && isFrontendRoute) {
    // Only allow authenticated admins on "/" (they get redirected to dashboard by useEffect)
    if (!(isAuthenticated && !isFrontendUser && pathname === "/")) {
      allowRender = false;
    }
  }



  return (
    <LayoutProvider>
      <NotificationProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "10px",
              background: "#222831",
              color: "#ffffff",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
              fontSize: "14px",
              fontWeight: 500,
              padding: "12px 16px",
            },
            success: {
              iconTheme: {
                primary: "#10B981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#EF4444",
                secondary: "#fff",
              },
            },
          }}
        />
        {allowRender ? (
          children
        ) : (
          <></>
        )}
      </NotificationProvider>
    </LayoutProvider>
  );
};

const AppProvidersWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <SettingsProvider>
        <AppProvidersInner>{children}</AppProvidersInner>
      </SettingsProvider>
    </Provider>
  );
};

export default AppProvidersWrapper;
