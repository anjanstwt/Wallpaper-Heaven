import { prisma } from "@repo/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const offer = await prisma.offer.findFirst({
            where: { validTill: { gte: new Date() } },
            orderBy: { createdAt: "desc" },
            select: {
                badge: true,
                discount: true,
                productName: true,
                productType: true,
                validTill: true,
            },
        });

        return NextResponse.json({ success: true, offer }, { status: 200 });
    } catch (error) {
        console.error("Error fetching active offer:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
