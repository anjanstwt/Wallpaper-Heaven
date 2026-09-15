import "server-only";
import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";

// Triggered by Vercel Cron (see vercel.json) instead of the in-process
// node-cron job the old Express server used, since serverless has no
// long-running process to host a cron scheduler. Runs once daily (not
// every 5 min like the old job) — Vercel's Hobby plan only allows
// daily-or-less-frequent cron schedules.
export async function GET(request: NextRequest) {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const deleted = await prisma.offer.deleteMany({
            where: {
                validTill: {
                    lt: new Date(),
                },
            },
        });

        return NextResponse.json({ success: true, deletedCount: deleted.count }, { status: 200 });
    } catch (error) {
        console.error("Failed to delete expired offers:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
