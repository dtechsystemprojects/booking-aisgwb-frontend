"use client";
import { useAccess } from "@/hooks/useAccess";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useAppSelector } from "@/redux/hooks";

interface ProtectedRouteProps {
  moduleName: string;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  moduleName,
  children,
}) => {
  const { read: canRead } = useAccess(moduleName);
  const { loading, checked, isAuthenticated, user } = useAppSelector(
    (state) => state.auth,
  );
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthReady = mounted && checked && !loading;

  useEffect(() => {
    if (isAuthReady && isAuthenticated && user && !canRead) {
      Swal.fire({
        title: "Access Denied",
        text: `You do not have permission to view the ${moduleName} module.`,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
        allowOutsideClick: false,
        allowEscapeKey: false,
      }).then(() => {
        router.push("/admin/dashboard");
      });
    }
  }, [isAuthReady, isAuthenticated, user, canRead, moduleName, router]);

  if (!isAuthReady) {
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

  if (!isAuthenticated || !canRead) {
    return null; // Render nothing while redirecting
  }

  return <>{children}</>;
};

export default ProtectedRoute;
