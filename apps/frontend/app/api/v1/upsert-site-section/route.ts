import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
    const session = await requireAdmin();
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { key, badge, title, subtitle, description, rootImage, images } = await request.json();

        if (!key) {
            return NextResponse.json({ message: "key is required" }, { status: 400 });
        }

        const section = await prisma.siteSection.upsert({
            where: { key },
            update: { badge, title, subtitle, description, rootImage, images: images ?? [] },
            create: { key, badge, title, subtitle, description, rootImage, images: images ?? [] },
        });

        return NextResponse.json({ success: true, section }, { status: 200 });
    } catch (error) {
        console.error("Error upserting site section:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
