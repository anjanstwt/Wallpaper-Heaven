import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const brandId = parseInt(request.nextUrl.searchParams.get("brandId") as string);
        if (!brandId || isNaN(brandId)) {
            return NextResponse.json({ message: "brandId is required" }, { status: 400 });
        }

        const [brand, products] = await Promise.all([
            prisma.brand.findUnique({
                where: { id: brandId },
                select: { id: true, name: true, about: true, description: true, image: true, rank: true },
            }),
            prisma.product.findMany({
                where: { brandId },
                orderBy: { addedAt: "desc" },
                select: {
                    id: true, name: true, images: true,
                    tags: { select: { id: true, name: true } },
                    ProductType: { select: { id: true, name: true } },
                },
            }),
        ]);

        if (!brand) {
            return NextResponse.json({ message: "Brand not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, brand, products }, { status: 200 });
    } catch (error) {
        console.error("Error fetching products by brand:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
