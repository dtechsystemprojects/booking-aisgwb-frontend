"use client";
import { useLayoutContext } from "@/context/useLayoutContext";
import { useAuth } from "@/hooks/useAuth";
import HorizontalLayout from "@/layouts/HorizontalLayout";
import VerticalLayout from "@/layouts/VerticalLayout";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { orientation } = useLayoutContext();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push("/auth/sign-in");
    }
  }, [isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return null;
  }

  return (
    <>
      {orientation === "vertical" && (
        <VerticalLayout>{children}</VerticalLayout>
      )}
      {orientation === "horizontal" && (
        <HorizontalLayout>{children}</HorizontalLayout>
      )}
    </>
  );
};

export default MainLayout;
