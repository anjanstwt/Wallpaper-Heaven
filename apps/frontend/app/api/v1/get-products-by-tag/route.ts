import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const tagId = parseInt(request.nextUrl.searchParams.get("tagId") as string);
        if (!tagId || isNaN(tagId)) {
            return NextResponse.json({ message: "tagId is required" }, { status: 400 });
        }

        const [tag, products] = await Promise.all([
            prisma.tag.findUnique({
                where: { id: tagId },
                select: { id: true, name: true, image: true },
            }),
            prisma.product.findMany({
                where: { tags: { some: { id: tagId } } },
                orderBy: { addedAt: "desc" },
                select: {
                    id: true, name: true, images: true,
                    tags: { select: { id: true, name: true } },
                    ProductType: { select: { id: true, name: true } },
                    brand: { select: { id: true, name: true } },
                },
            }),
        ]);

        if (!tag) {
            return NextResponse.json({ message: "Genre not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, tag, products }, { status: 200 });
    } catch (error) {
        console.error("Error fetching products by tag:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
