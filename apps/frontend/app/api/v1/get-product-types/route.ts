import { prisma } from "@repo/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const productTypes = await prisma.productType.findMany({
            orderBy: { name: "asc" },
            select: { id: true, name: true },
        });

        return NextResponse.json({ success: true, productTypes }, { status: 200 });
    } catch (error) {
        console.error("Error while fetching product types: ", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
