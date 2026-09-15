"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const adminLinks = [
    { label: "Add / Edit Product", href: "/admin/add-product", description: "Upload images and create new products" },
    { label: "Manage Product Types", href: "/admin/product-types", description: "Add or remove product categories" },
    { label: "Manage Brands", href: "/admin/brands", description: "Add or remove brands" },
    { label: "Manage Tags", href: "/admin/tags", description: "Add or remove tags" },
    { label: "Manage Creators", href: "/admin/creators", description: "Add or remove designers/creators" },
    { label: "User Queries", href: "/admin/queries", description: "View and respond to customer messages" },
];

export default function AdminDashboard() {
    const { data: session, status } = useSession(); // session used for email display below
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/admin");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9FAF8]">
                <p className="text-[#6D7278]">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9FAF8]">
            {/* Header */}
            <div className="bg-white border-b border-[#E5E7EB] px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-[#3D5A40]">Admin Dashboard</h1>
                    <p className="text-xs text-[#6D7278]">{session?.user?.email}</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <Link href="/" className="text-sm text-[#6D7278] hover:text-[#3D5A40] transition-colors hidden sm:inline">
                        View Site
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/admin" })}
                        className="text-sm bg-red-50 text-red-500 px-3 sm:px-4 py-2 rounded-full hover:bg-red-100 transition-colors font-medium"
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <h2 className="text-2xl font-bold text-[#3D5A40] mb-8">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {adminLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="bg-white border border-[#E5E7EB] rounded-xl p-6 hover:border-[#6DA165] hover:shadow-sm transition-all group"
                        >
                            <div className="font-semibold text-[#3D5A40] text-lg group-hover:text-[#6DA165] transition-colors">
                                {link.label}
                            </div>
                            <p className="text-sm text-[#6D7278] mt-1">{link.description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
