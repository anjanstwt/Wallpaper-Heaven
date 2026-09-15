import { prisma } from "@repo/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const creators = await prisma.creator.findMany({
            orderBy: { name: "asc" },
            select: { id: true, name: true, about: true, image: true },
        });

        return NextResponse.json({ success: true, creators }, { status: 200 });
    } catch (error) {
        console.error("Error while fetching creators: ", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
