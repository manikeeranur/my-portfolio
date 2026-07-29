"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, checked } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (checked && !isAuthenticated) router.replace("/login");
  }, [checked, isAuthenticated, router]);

  if (!checked || !isAuthenticated) return null;
  return children;
};

export default PrivateRoute;
