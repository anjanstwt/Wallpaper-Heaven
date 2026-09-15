"use client";
import { useSession } from "next-auth/react";

export function useAdminCheck() {
    const { data: session } = useSession();
    const isAdmin = !!session?.user;
    return { isAdmin };
}
