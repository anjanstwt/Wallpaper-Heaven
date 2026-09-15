import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { requireAdmin } from "@/lib/auth-helpers";

export async function DELETE(request: NextRequest) {
    const session = await requireAdmin();
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json({
                message: "Product ID is required"
            }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {

            const existingProduct = await tx.product.findUnique({
                where: { id: Number(productId) },
            });

            if (!existingProduct) {
                throw new Error("Product not found");
            }

            await tx.product.delete({
                where: { id: Number(productId) },
            });

        });

        return NextResponse.json({
            message: "Product deleted successfully",
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error while removing product:", error);
        return NextResponse.json({
            message: error.message || "Internal server error",
        }, { status: 400 });
    }
}
