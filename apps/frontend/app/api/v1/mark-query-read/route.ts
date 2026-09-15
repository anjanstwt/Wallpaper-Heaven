import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
    const session = await requireAdmin();
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, read } = await request.json();
    if (!id) {
        return NextResponse.json({ message: "Query id is required." }, { status: 400 });
    }

    try {
        const updated = await prisma.userQuery.update({
            where: { id: Number(id) },
            data: { read: read !== false },
        });
        return NextResponse.json({ success: true, query: updated }, { status: 200 });
    } catch (error) {
        console.error("Error marking query read:", error);
        return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
    }
}
