import "server-only";
import { getServerSession } from "next-auth";
import { authOptions, type CustomSession } from "@/app/api/auth/[...nextauth]/options";

export async function requireAdmin(): Promise<CustomSession | null> {
    const session = (await getServerSession(authOptions)) as CustomSession | null;
    if (!session?.user) return null;
    return session;
}
