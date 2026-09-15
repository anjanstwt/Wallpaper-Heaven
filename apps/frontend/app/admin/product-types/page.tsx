"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { IconTrash, IconArrowLeft } from "@tabler/icons-react";
import { GET_PRODUCT_TYPES_URL, UPSERT_PRODUCT_TYPE_URL, DELETE_PRODUCT_TYPE_URL } from "@/routes/routes";

interface ProductType { id: number; name: string }

export default function ManageProductTypes() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [types, setTypes] = useState<ProductType[]>([]);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") router.replace("/admin");
    }, [status, router]);


    const fetchTypes = async () => {
        const { data } = await axios.get(GET_PRODUCT_TYPES_URL);
        setTypes(data.productTypes ?? []);
    };

    useEffect(() => {
        if (status === "authenticated") fetchTypes();
    }, [status]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        setError("");
        try {
            await axios.post(UPSERT_PRODUCT_TYPE_URL, { name });
            setName("");
            await fetchTypes();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to add product type.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this product type? All linked products will also be deleted.")) return;
        try {
            await axios.delete(DELETE_PRODUCT_TYPE_URL, { data: { id } });
            setTypes((prev) => prev.filter((t) => t.id !== id));
        } catch {
            alert("Failed to delete.");
        }
    };

    if (status === "loading") return <div className="min-h-screen flex items-center justify-center bg-[#F9FAF8]"><p className="text-[#6D7278]">Loading...</p></div>;

    return (
        <div className="min-h-screen bg-[#F9FAF8]">
            <div className="bg-white border-b border-[#E5E7EB] px-4 sm:px-8 py-4 flex items-center gap-4">
                <Link href="/admin/dashboard" className="text-[#6D7278] hover:text-[#3D5A40] transition-colors">
                    <IconArrowLeft size={20} />
                </Link>
                <h1 className="text-lg sm:text-xl font-bold text-[#3D5A40]">Manage Product Types</h1>
            </div>

            <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex flex-col gap-8">
                {/* Add form */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                    <h2 className="font-semibold text-[#3D5A40] text-lg mb-4">Add Product Type</h2>
                    <form onSubmit={handleAdd} className="flex gap-3">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Wallpapers"
                            className="flex-1 border border-[#D1D5DB] rounded-full px-5 py-2.5 text-sm text-[#3D5A40] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6DA165]"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#6DA165] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#5a914e] transition-colors disabled:opacity-60"
                        >
                            {loading ? "Adding..." : "Add"}
                        </button>
                    </form>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>

                {/* List */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                    <h2 className="font-semibold text-[#3D5A40] text-lg mb-4">Existing Types ({types.length})</h2>
                    {types.length === 0
                        ? <p className="text-[#6D7278] text-sm">No product types yet.</p>
                        : (
                            <ul className="flex flex-col gap-2">
                                {types.map((t) => (
                                    <li key={t.id} className="flex justify-between items-center gap-2 border border-[#E5E7EB] rounded-xl px-3 sm:px-4 py-3">
                                        <span className="text-[#3D5A40] font-medium break-words min-w-0">{t.name}</span>
                                        <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-600 transition-colors">
                                            <IconTrash size={18} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )
                    }
                </div>
            </div>
        </div>
    );
}
