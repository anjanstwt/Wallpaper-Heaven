import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
    const session = await requireAdmin();
    if (!session) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, name, about, description, image, rank } = await request.json();

        if (!name || !about) {
            return NextResponse.json({
                success: false,
                message: "Invalid data",
            }, { status: 400 });
        }

        const data = await prisma.$transaction(async (t) => {

            let existingBrand;

            if (id) {
                existingBrand = await t.brand.findUnique({
                    where: {
                        id: id,
                    },
                });
            }

            const rankVal = rank != null ? Number(rank) : null;
            if (existingBrand) {
                const updatedBrand = await t.brand.update({
                    where: { id },
                    data: { name, about, description, image, rank: rankVal },
                    select: { id: true, name: true, about: true, description: true, image: true, rank: true },
                });
                return updatedBrand;
            } else {
                const newBrand = await t.brand.create({
                    data: { name, about, description, image, rank: rankVal },
                    select: { id: true, name: true, about: true, description: true, image: true, rank: true },
                });
                return newBrand;
            }
        });


        return NextResponse.json({
            success: true,
            message: "brand updated successfully",
            brand: data,
        }, { status: 200 });

    } catch (error) {
        console.error("Error while upserting brand: ", error);
        return NextResponse.json({
            success: false,
            message: "Internal server error",
        }, { status: 500 });
    }
}
