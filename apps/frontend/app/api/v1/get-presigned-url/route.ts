import { NextRequest, NextResponse } from "next/server";
import S3ClientActions from "@/lib/s3Client";
import { requireAdmin } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
    const session = await requireAdmin();
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { fileType } = await request.json();
        if (!fileType) {
            return NextResponse.json({ message: "File type is required" }, { status: 400 });
        }

        if (!fileType.includes("/")) {
            return NextResponse.json({
                message: "Invalid file type format. Expected format: 'image/png'",
            }, { status: 400 });
        }

        const s3Actions = new S3ClientActions();
        const { signedUrl, publicUrl, key } = await s3Actions.getPresignedUrl(fileType);

        return NextResponse.json({
            success: true,
            uploadUrl: signedUrl,
            publicUrl,
            key,
        }, { status: 200 });
    } catch (error) {
        console.error("Error generating pre-signed URL:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to generate pre-signed URL",
        }, { status: 500 });
    }
}
