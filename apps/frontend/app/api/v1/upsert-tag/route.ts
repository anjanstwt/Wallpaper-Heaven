import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
    const session = await requireAdmin();
    if (!session) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, name, image } = await request.json();

        if (!name) {
            return NextResponse.json({
                success: false,
                message: "Invalid data",
            }, { status: 400 });
        }

        const data = await prisma.$transaction(async (t) => {

            let existingTag;

            if (id) {
                existingTag = await t.tag.findUnique({
                    where: {
                        id: id,
                    },
                });
            }

            if (existingTag) {
                const updatedTag = await t.tag.update({
                    where: { id },
                    data: { name, image },
                    select: { id: true, name: true, image: true },
                });
                return updatedTag;
            } else {
                const newTag = await t.tag.create({
                    data: { name, image },
                    select: { id: true, name: true, image: true },
                });
                return newTag;
            }
        });

        return NextResponse.json({
            success: true,
            message: "Tag updated successfully",
            tag: data,
        }, { status: 200 });

    } catch (error) {
        console.error("Error while upserting tag: ", error);
        return NextResponse.json({
            success: false,
            message: "Internal server error",
        }, { status: 500 });
    }
}
