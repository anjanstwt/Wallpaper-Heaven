import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const productTypeId = parseInt(request.nextUrl.searchParams.get("productTypeId") as string);

        if (!productTypeId || isNaN(productTypeId)) {
            return NextResponse.json({
                message: "productTypeId not provided or invalid",
            }, { status: 400 });
        }

        const products = await prisma.product.findMany({
            where: {
                productTypeId,
            },
            take: 15,
            orderBy: { addedAt: "desc" },
            select: {
                id: true,
                name: true,
                images: true,
                tags: true,
                brand: true,
                creator: true,
                ProductType: true,
            },
        });

        return NextResponse.json({
            message: "Fetched data",
            products,
        }, { status: 200 });

    } catch (error) {
        console.error("Error while getting products: ", error);
        return NextResponse.json({
            message: "Internal server error",
        }, { status: 500 });
    }
}
