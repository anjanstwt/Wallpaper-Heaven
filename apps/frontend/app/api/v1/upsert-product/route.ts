import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { requireAdmin } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
    const session = await requireAdmin();
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const addedById = session.user!.id;

    const { id, images, name, description, brandId, creatorId, tagsId, productTypeId } = await request.json();

    try {
        if (!productTypeId || !images || !name || !description || !tagsId) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const imageArray = Array.isArray(images) ? images : [images];
        const tagIds = Array.isArray(tagsId) ? tagsId.map(Number) : [Number(tagsId)];
        const productTypeIdNum = Number(productTypeId);
        const brandIdNum = brandId ? Number(brandId) : undefined;
        const creatorIdNum = creatorId ? Number(creatorId) : undefined;

        const result = await prisma.$transaction(async (tx) => {

            const productType = await tx.productType.findUnique({ where: { id: productTypeIdNum } });
            if (!productType) throw new Error("Product type not found");

            if (brandIdNum) {
                const brand = await tx.brand.findUnique({ where: { id: brandIdNum } });
                if (!brand) throw new Error("Brand not found");
            }

            if (creatorIdNum) {
                const creator = await tx.creator.findUnique({ where: { id: creatorIdNum } });
                if (!creator) throw new Error("Creator not found");
            }

            const existingTags = await tx.tag.findMany({ where: { id: { in: tagIds } } });
            if (existingTags.length !== tagIds.length) throw new Error("One or more tags not found");

            if (id) {
                // Update existing product
                const updated = await tx.product.update({
                    where: { id: Number(id) },
                    data: {
                        name,
                        description,
                        images: imageArray,
                        addedAt: new Date(),
                        brandId: brandIdNum,
                        creatorId: creatorIdNum,
                        tags: { set: tagIds.map((tid) => ({ id: tid })) },
                    },
                    include: { tags: true, brand: true, creator: true, ProductType: true },
                });
                return updated;
            } else {
                // Create new product
                const created = await tx.product.create({
                    data: {
                        name,
                        description,
                        images: imageArray,
                        addedAt: new Date(),
                        addedById,
                        brandId: brandIdNum,
                        creatorId: creatorIdNum,
                        productTypeId: productTypeIdNum,
                        tags: { connect: tagIds.map((tid) => ({ id: tid })) },
                    },
                    include: { tags: true, brand: true, creator: true, ProductType: true },
                });
                return created;
            }
        });

        return NextResponse.json({
            message: "Product upserted successfully",
            product: result,
        }, { status: 200 });
    } catch (error: any) {
        console.error("Error while upserting product:", error);
        return NextResponse.json({
            message: error.message || "Internal server error",
        }, { status: 400 });
    }
}
