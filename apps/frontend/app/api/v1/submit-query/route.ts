import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { name, email, phone, message } = await request.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
        return NextResponse.json({ success: false, message: "Name, email, and message are required." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return NextResponse.json({ success: false, message: "Invalid email address." }, { status: 400 });
    }

    try {
        const query = await prisma.userQuery.create({
            data: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phone: phone?.trim() || null,
                message: message.trim(),
            },
        });
        return NextResponse.json({ success: true, query }, { status: 201 });
    } catch (error) {
        console.error("Error saving user query:", error);
        return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
    }
}
