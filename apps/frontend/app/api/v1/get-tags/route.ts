import { prisma } from "@repo/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const tags = await prisma.tag.findMany({
            orderBy: { name: "asc" },
            select: { id: true, name: true, image: true },
        });

        return NextResponse.json({ success: true, tags }, { status: 200 });
    } catch (error) {
        console.error("Error while fetching tags: ", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
