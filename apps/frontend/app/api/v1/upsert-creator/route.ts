import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
    const session = await requireAdmin();
    if (!session) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, name, about, description, image } = await request.json();

        if (!name || !about) {
            return NextResponse.json({ success: false, message: "name and about are required" }, { status: 400 });
        }

        let creator;
        if (id) {
            creator = await prisma.creator.update({
                where: { id: Number(id) },
                data: { name, about, description, image },
                select: { id: true, name: true, about: true, description: true, image: true },
            });
        } else {
            creator = await prisma.creator.create({
                data: { name, about, description, image },
                select: { id: true, name: true, about: true, description: true, image: true },
            });
        }

        return NextResponse.json({ success: true, message: "Creator upserted successfully", creator }, { status: 200 });
    } catch (error) {
        console.error("Error while upserting creator: ", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
