"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { IconTrash, IconArrowLeft } from "@tabler/icons-react";
import { GET_TAGS_URL, UPSERT_TAG_URL, REMOVE_TAG_URL } from "@/routes/routes";

interface Tag { id: number; name: string }

export default function ManageTags() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [tags, setTags] = useState<Tag[]>([]);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") router.replace("/admin");
    }, [status, router]);


    const fetchTags = async () => {
        const { data } = await axios.get(GET_TAGS_URL);
        setTags(data.tags ?? []);
    };

    useEffect(() => {
        if (status === "authenticated") fetchTags();
    }, [status]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        setError("");
        try {
            await axios.post(UPSERT_TAG_URL, { name });
            setName("");
            await fetchTags();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to add tag.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this tag?")) return;
        try {
            await axios.delete(REMOVE_TAG_URL, { data: { id } });
            setTags((prev) => prev.filter((t) => t.id !== id));
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
                <h1 className="text-lg sm:text-xl font-bold text-[#3D5A40]">Manage Tags</h1>
            </div>

            <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex flex-col gap-8">
                {/* Add form */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                    <h2 className="font-semibold text-[#3D5A40] text-lg mb-4">Add Tag</h2>
                    <form onSubmit={handleAdd} className="flex gap-3">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Pichwai"
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
                    <h2 className="font-semibold text-[#3D5A40] text-lg mb-4">Existing Tags ({tags.length})</h2>
                    {tags.length === 0
                        ? <p className="text-[#6D7278] text-sm">No tags yet.</p>
                        : (
                            <div className="flex flex-wrap gap-2">
                                {tags.map((t) => (
                                    <div key={t.id} className="flex items-center gap-2 bg-[#6DA165]/10 border border-[#6DA165]/30 text-[#3D5A40] rounded-full px-4 py-1.5 text-sm font-medium">
                                        <span>{t.name}</span>
                                        <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-600 transition-colors">
                                            <IconTrash size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
}
