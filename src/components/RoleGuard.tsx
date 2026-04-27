import { Navigate } from "react-router-dom";
import { useUserRole, type AppRole } from "@/hooks/useUserRole";

export function RoleGuard({
  role,
  children,
}: {
  role: AppRole;
  children: React.ReactNode;
}) {
  const { roles, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!roles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
