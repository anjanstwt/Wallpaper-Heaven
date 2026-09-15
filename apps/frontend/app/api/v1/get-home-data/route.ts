import { prisma } from "@repo/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const productTypes = await prisma.productType.findMany();

        const data = await Promise.all(
            productTypes.map(async (type) => {
                const products = await prisma.product.findMany({
                    where: {
                        productTypeId: type.id
                    },
                    take: 10,
                    orderBy: { addedAt: 'desc' },
                    select: {
                        id: true,
                        brand: true,
                        name: true,
                        tags: true,
                        images: true,
                        ProductType: true,
                        creator: true,
                    },
                });
                return {
                    productType: type,
                    products
                };
            })
        )

        return NextResponse.json({
            message: "Home data fetched successfully",
            data,
        }, { status: 200 });

    } catch (error) {
        console.error("Error while fetching home data: ", error);
        return NextResponse.json({
            message: 'Internal server error',
        }, { status: 500 });
    }
}
