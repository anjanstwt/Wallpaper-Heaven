import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const productId = parseInt(request.nextUrl.searchParams.get("productId") as string);

        if (!productId || isNaN(productId)) {
            return NextResponse.json({
                message: "Missing or invalid product id",
            }, { status: 400 });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: {
                id: true,
                name: true,
                description: true,
                images: true,
                addedAt: true,
                creator: true,
                brand: true,
                tags: true,
                ProductType: true,
            }
        });

        if (!product) {
            return NextResponse.json({ message: "Product not found" }, { status: 404 });
        }

        const similarProducts = await prisma.product.findMany({
            where: {
                productTypeId: product.ProductType.id,
                id: { not: productId },
            },
            take: 10,
            select: {
                id: true,
                name: true,
                images: true,
            },
        });

        return NextResponse.json({
            message: "Product details fetched successfully",
            product,
            similarProducts,
        }, { status: 200 });

    } catch (error) {
        console.error("Error while fetching product data: ", error);
        return NextResponse.json({
            message: "Internal server error",
        }, { status: 500 });
    }
}
