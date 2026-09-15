"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { IconTrash, IconArrowLeft } from "@tabler/icons-react";
import { GET_CREATORS_URL, UPSERT_CREATOR_URL, REMOVE_CREATOR_URL } from "@/routes/routes";
import ImageUploadInput from "@/Components/ui/ImageUploadInput";

interface Creator { id: number; name: string; about: string; image?: string }

const empty = { name: "", about: "", description: "", image: "" };

export default function ManageCreators() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [creators, setCreators] = useState<Creator[]>([]);
    const [form, setForm] = useState(empty);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") router.replace("/admin");
    }, [status, router]);


    const fetchCreators = async () => {
        const { data } = await axios.get(GET_CREATORS_URL);
        setCreators(data.creators ?? []);
    };

    useEffect(() => {
        if (status === "authenticated") fetchCreators();
    }, [status]);

    const set = (field: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [field]: e.target.value }));

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.about.trim()) return;
        setLoading(true);
        setError("");
        try {
            await axios.post(UPSERT_CREATOR_URL, form);
            setForm(empty);
            await fetchCreators();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to add creator.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this creator?")) return;
        try {
            await axios.delete(REMOVE_CREATOR_URL, { data: { id } });
            setCreators((prev) => prev.filter((c) => c.id !== id));
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
                <h1 className="text-lg sm:text-xl font-bold text-[#3D5A40]">Manage Creators</h1>
            </div>

            <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex flex-col gap-8">
                {/* Add form */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                    <h2 className="font-semibold text-[#3D5A40] text-lg mb-4">Add Creator</h2>
                    <form onSubmit={handleAdd} className="flex flex-col gap-3">
                        <input type="text" value={form.name} onChange={set("name")} placeholder="Creator name *" required
                            className="border border-[#D1D5DB] rounded-full px-5 py-2.5 text-sm text-[#3D5A40] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6DA165]" />
                        <input type="text" value={form.about} onChange={set("about")} placeholder="Short bio / tagline *" required
                            className="border border-[#D1D5DB] rounded-full px-5 py-2.5 text-sm text-[#3D5A40] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6DA165]" />
                        <textarea value={form.description} onChange={set("description")} placeholder="Full description (optional)" rows={3}
                            className="border border-[#D1D5DB] rounded-2xl px-5 py-2.5 text-sm text-[#3D5A40] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6DA165] resize-none" />
                        <ImageUploadInput value={form.image} onChange={(url) => setForm((f) => ({ ...f, image: url }))} />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button type="submit" disabled={loading}
                            className="self-end bg-[#6DA165] text-white px-8 py-2.5 rounded-full text-sm font-semibold hover:bg-[#5a914e] transition-colors disabled:opacity-60">
                            {loading ? "Adding..." : "Add Creator"}
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                    <h2 className="font-semibold text-[#3D5A40] text-lg mb-4">Existing Creators ({creators.length})</h2>
                    {creators.length === 0
                        ? <p className="text-[#6D7278] text-sm">No creators yet.</p>
                        : (
                            <ul className="flex flex-col gap-3">
                                {creators.map((c) => (
                                    <li key={c.id} className="flex justify-between items-center gap-2 border border-[#E5E7EB] rounded-xl px-3 sm:px-4 py-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {c.image
                                                ? <div className="relative h-10 w-10 rounded-full overflow-hidden border border-[#E5E7EB] flex-shrink-0">
                                                    <Image src={c.image} alt={c.name} fill className="object-cover" />
                                                </div>
                                                : <div className="h-10 w-10 rounded-full bg-[#6DA165]/20 flex items-center justify-center text-[#3D5A40] font-bold text-sm flex-shrink-0">
                                                    {c.name[0]}
                                                </div>
                                            }
                                            <div className="min-w-0">
                                                <p className="text-[#3D5A40] font-semibold text-sm break-words">{c.name}</p>
                                                <p className="text-[#6D7278] text-xs break-words">{c.about}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
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
