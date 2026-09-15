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
            return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });
        }

        await prisma.productType.delete({ where: { id: Number(id) } });

        return NextResponse.json({ success: true, message: "Product type deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error while deleting product type: ", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
