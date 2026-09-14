import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Swal from "sweetalert2";

export interface AccessControl {
  read: boolean;
  write: boolean;
  delete: boolean;
  export: boolean;
}

export const useAccess = (moduleName: string): AccessControl => {
  const { user } = useAppSelector((state) => state.auth);

  const accessRules = user?.accessRules || [];
  const rule = accessRules.find((r: any) => {
    const mod = r.moduleName?.trim()?.toLowerCase();
    const target = moduleName?.trim()?.toLowerCase();
    if (mod === target) return true;
    return false;
  });

  if (rule) {
    return {
      read: rule.read,
      write: rule.write,
      delete: rule.delete,
      export: rule.export,
    };
  }

  // Super Admin bypass
  if (user?.groupId === "GRP-1" || user?.groupName === "Super Admin" || (user as any)?.group === "Super Admin") {
    return { read: true, write: true, delete: true, export: true };
  }

  // Default to false if no rule exists
  return { read: false, write: false, delete: false, export: false };
};

export const usePageAccess = (moduleName: string): AccessControl => {
  const access = useAccess(moduleName);
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Only check and redirect if the user is fully loaded and authenticated
    if (isAuthenticated && user && !access.read) {
      Swal.fire({
        title: "Access Denied",
        text: `You do not have permission to access the ${moduleName} module.`,
        icon: "warning",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      }).then(() => {
        router.push("/admin/dashboard");
      });
    }
  }, [access.read, moduleName, router, isAuthenticated, user]);

  return access;
};
