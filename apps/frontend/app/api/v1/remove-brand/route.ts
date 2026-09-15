import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";

export async function DELETE(request: NextRequest) {
    const session = await requireAdmin();
    if (!session) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ success: false, message: "Brand id is required" }, { status: 400 });
        }

        await prisma.brand.delete({ where: { id: Number(id) } });

        return NextResponse.json({ success: true, message: "Brand removed successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error while removing brand: ", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
