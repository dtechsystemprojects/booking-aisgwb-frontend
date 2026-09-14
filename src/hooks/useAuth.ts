"use client";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  checkAuth,
  loginUser,
  logoutUser,
  registerUser,
} from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import toast from "react-hot-toast";

export const useAuth = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, loading, error, checked } =
    useAppSelector((state) => state.auth);

  const login = async (
    identifier: string,
    credential?: string,
    isOtpAuth = false,
  ) => {
    try {
      const resultAction = await dispatch(
        loginUser({ identifier, password: credential, credential, isOtpAuth }),
      );
      if (loginUser.rejected.match(resultAction)) {
        throw new Error(
          (resultAction.payload as string) || "Authentication failed",
        );
      }
      if (typeof window !== "undefined") {
        sessionStorage.setItem("show_login_toast", "true");
        const urlParams = new URLSearchParams(window.location.search);
        let redirectUrl = urlParams.get("redirect");
        if (!redirectUrl) {
          redirectUrl = sessionStorage.getItem("postLoginRedirect");
        }
        if (redirectUrl) {
          sessionStorage.removeItem("postLoginRedirect");
        }
        router.push(redirectUrl || "/admin/dashboard");
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      throw err;
    }
  };

  const logout = async () => {
    await dispatch(logoutUser());
    toast.success("Successfully logged out.");
    router.push("/auth/sign-in");
  };

  const checkSession = useCallback(async () => {
    await dispatch(checkAuth());
  }, [dispatch]);

  const register = async (userData: {
    fullName: string;
    identifier: string;
    password: string;
  }) => {
    try {
      const resultAction = await dispatch(registerUser(userData));
      if (registerUser.rejected.match(resultAction)) {
        throw new Error(
          (resultAction.payload as string) || "Registration failed",
        );
      }
      return resultAction.payload;
    } catch (err: any) {
      throw err;
    }
  };

  return {
    user,
    token,
    login,
    logout,
    checkSession,
    register,
    isAuthenticated,
    loading,
    error,
    checked,
  };
};
