import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { tags } = await request.json();

        if (!tags) {
            return NextResponse.json({
                message: "No tags provided",
            }, { status: 400 });
        }

        const tagsArray = Array.isArray(tags) ? tags : [tags];

        const data = await Promise.all(
            tagsArray.map(async (tag) => {
                const products = await prisma.product.findMany({
                    where: {
                        tags: {
                            some: {
                                name: tag,
                            },
                        },
                    },
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        images: true,
                    }
                })
                return {
                    tag: tag,
                    products: products,
                };
            })
        )

        return NextResponse.json({
            message: "Products fetched successfully",
            data,
        }, { status: 200 });

    } catch (error) {
        console.error("Error while getting products: ", error);
        return NextResponse.json({
            message: "Internal server error",
        }, { status: 500 });
    }
}
