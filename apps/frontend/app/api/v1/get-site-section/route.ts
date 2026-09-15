import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const key = request.nextUrl.searchParams.get("key");
        if (!key) {
            return NextResponse.json({ message: "key is required" }, { status: 400 });
        }

        const section = await prisma.siteSection.findUnique({ where: { key } });

        return NextResponse.json({ success: true, section: section ?? null }, { status: 200 });
    } catch (error) {
        console.error("Error fetching site section:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
