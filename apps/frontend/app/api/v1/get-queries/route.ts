import { prisma } from "@repo/db";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET() {
    const session = await requireAdmin();
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const queries = await prisma.userQuery.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ success: true, queries }, { status: 200 });
    } catch (error) {
        console.error("Error fetching queries:", error);
        return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
    }
}
