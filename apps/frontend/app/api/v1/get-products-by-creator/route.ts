import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const creatorId = parseInt(request.nextUrl.searchParams.get("creatorId") as string);
        if (!creatorId || isNaN(creatorId)) {
            return NextResponse.json({ message: "creatorId is required" }, { status: 400 });
        }

        const [creator, products] = await Promise.all([
            prisma.creator.findUnique({
                where: { id: creatorId },
                select: { id: true, name: true, about: true, description: true, image: true },
            }),
            prisma.product.findMany({
                where: { creatorId },
                orderBy: { addedAt: "desc" },
                select: {
                    id: true, name: true, images: true,
                    tags: { select: { id: true, name: true } },
                    ProductType: { select: { id: true, name: true } },
                    brand: { select: { id: true, name: true } },
                },
            }),
        ]);

        if (!creator) {
            return NextResponse.json({ message: "Designer not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, creator, products }, { status: 200 });
    } catch (error) {
        console.error("Error fetching products by creator:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
