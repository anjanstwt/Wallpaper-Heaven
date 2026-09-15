import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
    const session = await requireAdmin();
    if (!session) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, name } = await request.json();

        if (!name && typeof name !== "string") {
            return NextResponse.json({
                success: false,
                message: "Invalid name",
            }, { status: 400 });
        }

        const data = await prisma.$transaction(async (t) => {

            let existingProductType;

            if (id) {
                existingProductType = await t.productType.findUnique({
                    where: {
                        id: id,
                    },
                });
            }

            if (existingProductType) {
                const updatedProductType = await t.productType.update({
                    where: {
                        id: id,
                    },
                    data: {
                        name: name,
                    },
                    select: {
                        id: true,
                        name: true,
                    }
                });
                return updatedProductType;
            } else {
                const newProductType = await t.productType.create({
                    data: {
                        name: name,
                    },
                    select: {
                        id: true,
                        name: true,
                    }
                });
                return newProductType;
            }
        });

        return NextResponse.json({
            success: true,
            message: "new product type added",
            prodductType: data,
        }, { status: 200 });

    } catch (error) {
        console.error("Error while upserting product type: ", error);
        return NextResponse.json({
            success: false,
            message: "Internal server error",
        }, { status: 500 });
    }
}
