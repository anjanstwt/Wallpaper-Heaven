import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const tag = request.nextUrl.searchParams.get("tag");
        const limit = request.nextUrl.searchParams.get("limit") ?? "20";

        const products = await prisma.product.findMany({
            where: tag
                ? { tags: { some: { name: tag } } }
                : undefined,
            take: parseInt(limit),
            orderBy: { addedAt: "desc" },
            select: {
                id: true,
                name: true,
                images: true,
                tags: { select: { id: true, name: true } },
            },
        });

        return NextResponse.json({ success: true, products }, { status: 200 });
    } catch (error) {
        console.error("Error fetching featured products:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
