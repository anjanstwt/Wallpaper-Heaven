import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
    const session = await requireAdmin();
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, name, images } = await request.json();

    if (!id || !name?.trim() || !Array.isArray(images) || images.length === 0) {
        return NextResponse.json({ message: "id, name, and at least one image are required" }, { status: 400 });
    }

    try {
        const updated = await prisma.product.update({
            where: { id: Number(id) },
            data: { name: name.trim(), images },
            select: { id: true, name: true, images: true },
        });
        return NextResponse.json({ success: true, product: updated }, { status: 200 });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Internal server error";
        console.error("Error updating product basics:", error);
        return NextResponse.json({ message: msg }, { status: 400 });
    }
}
