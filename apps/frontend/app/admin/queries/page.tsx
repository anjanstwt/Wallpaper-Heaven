"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { CheckCircle, Circle, Mail, Phone, Clock, MessageSquare, ArrowLeft } from "lucide-react";
import { GET_QUERIES_URL, MARK_QUERY_READ_URL } from "@/routes/routes";

type Query = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    read: boolean;
    createdAt: string;
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

export default function QueriesPage() {
    const { status } = useSession();
    const router = useRouter();
    const [queries, setQueries] = useState<Query[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

    useEffect(() => {
        if (status === "unauthenticated") router.replace("/admin");
    }, [status, router]);

    useEffect(() => {
        if (status !== "authenticated") return;
        axios
            .get(GET_QUERIES_URL)
            .then(({ data }) => setQueries(data.queries ?? []))
            .catch(() => toast.error("Failed to load queries."))
            .finally(() => setLoading(false));
    }, [status]);

    const toggleRead = async (query: Query) => {
        try {
            const { data } = await axios.post(
                MARK_QUERY_READ_URL,
                { id: query.id, read: !query.read }
            );
            setQueries(prev => prev.map(q => q.id === query.id ? data.query : q));
        } catch { toast.error("Failed to update status."); }
    };

    const filtered = queries.filter(q =>
        filter === "all" ? true : filter === "unread" ? !q.read : q.read
    );

    const unreadCount = queries.filter(q => !q.read).length;

    return (
        <div className="min-h-screen bg-[#F9FAF8]">
            {/* Header */}
            <div className="bg-white border-b border-[#E5E7EB] px-4 sm:px-6 py-4 flex items-center gap-4">
                <button
                    onClick={() => router.push("/admin/dashboard")}
                    className="text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-[#3D5A40]">User Queries</h1>
                    <p className="text-xs text-neutral-400">{unreadCount} unread · {queries.length} total</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filter tabs */}
                <div className="flex gap-2 mb-6">
                    {(["all", "unread", "read"] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
                                filter === f
                                    ? "bg-[#3D5A40] text-white"
                                    : "bg-white border border-[#E5E7EB] text-neutral-500 hover:border-[#6DA165]"
                            }`}
                        >
                            {f}{f === "unread" && unreadCount > 0 && (
                                <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="animate-pulse bg-white rounded-2xl p-6 border border-[#E5E7EB]">
                                <div className="h-4 w-1/3 rounded-full bg-neutral-100 mb-3" />
                                <div className="h-3 w-1/2 rounded-full bg-neutral-100 mb-2" />
                                <div className="h-3 w-2/3 rounded-full bg-neutral-100" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                            <MessageSquare className="w-7 h-7 text-neutral-300" />
                        </div>
                        <p className="text-lg font-semibold text-neutral-700">No queries yet</p>
                        <p className="text-neutral-400 text-sm mt-1">They&apos;ll appear here when users submit messages.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map(query => (
                            <div
                                key={query.id}
                                className={`bg-white rounded-2xl border p-5 transition-all ${
                                    query.read ? "border-[#E5E7EB]" : "border-[#6DA165]/40 shadow-sm"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        {/* Name + timestamp */}
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <span className="font-semibold text-neutral-800">{query.name}</span>
                                            {!query.read && (
                                                <span className="text-xs bg-[#6DA165]/15 text-[#3D5A40] px-2 py-0.5 rounded-full font-medium">
                                                    New
                                                </span>
                                            )}
                                            <span className="text-xs text-neutral-400 flex items-center gap-1 ml-auto">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(query.createdAt)}
                                            </span>
                                        </div>

                                        {/* Contact info */}
                                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mb-3">
                                            <a
                                                href={`mailto:${query.email}`}
                                                className="flex items-center gap-1.5 text-sm text-[#3D5A40] hover:underline"
                                            >
                                                <Mail className="w-3.5 h-3.5" />
                                                {query.email}
                                            </a>
                                            {query.phone && (
                                                <a
                                                    href={`tel:${query.phone}`}
                                                    className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700"
                                                >
                                                    <Phone className="w-3.5 h-3.5" />
                                                    {query.phone}
                                                </a>
                                            )}
                                        </div>

                                        {/* Message */}
                                        <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
                                            {query.message}
                                        </p>
                                    </div>

                                    {/* Mark read toggle */}
                                    <button
                                        onClick={() => toggleRead(query)}
                                        title={query.read ? "Mark as unread" : "Mark as read"}
                                        className="flex-shrink-0 mt-0.5 text-neutral-300 hover:text-[#6DA165] transition-colors"
                                    >
                                        {query.read
                                            ? <CheckCircle className="w-5 h-5 text-[#6DA165]" />
                                            : <Circle className="w-5 h-5" />
                                        }
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
