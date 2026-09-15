import { prisma } from "@repo/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const brands = await prisma.brand.findMany({
            orderBy: [{ rank: "asc" }, { name: "asc" }],
            select: { id: true, name: true, about: true, image: true, rank: true },
        });

        return NextResponse.json({ success: true, brands }, { status: 200 });
    } catch (error) {
        console.error("Error while fetching brands: ", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
