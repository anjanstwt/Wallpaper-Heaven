"use client";

import { ChevronRight, Pencil, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import EditPanel, { FieldInput, FieldLabel } from "@/Components/admin/EditPanel";
import ImageUploadInput from "@/Components/ui/ImageUploadInput";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { GET_BRANDS_URL, UPSERT_BRAND_URL, REMOVE_BRAND_URL } from "@/routes/routes";

type Brand = { id: number; name: string; image: string; about: string; rank?: number | null };
type FallbackBrand = { name: string; image: string; isFallback: true };
type DisplayBrand = Brand | FallbackBrand;

const FALLBACK: FallbackBrand[] = [
    { name: "Brand 1", image: "/images/curtains.png", isFallback: true },
    { name: "Brand 2", image: "/images/home.png", isFallback: true },
    { name: "Brand 3", image: "/images/decor-items.png", isFallback: true },
    { name: "Brand 4", image: "/images/curtains.png", isFallback: true },
    { name: "Brand 5", image: "/images/home.png", isFallback: true },
    { name: "Brand 6", image: "/images/decor-items.png", isFallback: true },
];

function isFallback(b: DisplayBrand): b is FallbackBrand {
    return (b as FallbackBrand).isFallback === true;
}

interface BrandCardProps {
    brand: DisplayBrand;
    isAdmin: boolean;
    canDelete: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

function BrandCard({ brand, isAdmin, canDelete, onEdit, onDelete }: BrandCardProps) {
    const real = !isFallback(brand);
    return (
        <div
            className="relative group w-full h-full rounded-xl overflow-hidden shadow-lg shadow-neutral-300 hover:-translate-y-0.5 transition-all transform duration-200 ease-in-out"
            style={{ backgroundImage: `url(${brand.image})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
            <div className="absolute inset-0 bg-black/20" />

            {/* Admin action buttons — hover reveal */}
            {isAdmin && real && (
                <div className="absolute top-3 right-3 flex gap-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={e => { e.stopPropagation(); onEdit(); }}
                        title="Edit brand"
                        className="bg-white/90 text-neutral-700 hover:text-[#3D5A40] p-2 rounded-full shadow-md hover:scale-110 transition-all duration-150"
                    >
                        <Pencil size={14} />
                    </button>
                    <button
                        onClick={e => { e.stopPropagation(); onDelete(); }}
                        title={canDelete ? "Delete brand" : "Cannot delete — minimum 6 brands required"}
                        disabled={!canDelete}
                        className="bg-white/90 text-neutral-700 hover:text-red-600 p-2 rounded-full shadow-md hover:scale-110 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )}

            {/* Rank badge */}
            {real && (brand as Brand).rank != null && (brand as Brand).rank! <= 6 && (
                <div className="absolute top-3 left-3 z-40 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-full">
                    #{(brand as Brand).rank}
                </div>
            )}

            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white z-40">
                <span className="text-xl font-semibold drop-shadow-2xl">{brand.name}</span>
                <button className="bg-black/70 p-2 rounded-full flex items-center shadow-sm justify-center hover:bg-black/80 hover:scale-105 transition transform duration-200">
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}

type PanelMode = "add" | "edit";

export default function HomeTopBrand() {
    const router = useRouter();
    const [brands, setBrands] = useState<Brand[]>([]);
    const { isAdmin, token } = useAdminCheck();

    const [panelOpen, setPanelOpen] = useState(false);
    const [panelMode, setPanelMode] = useState<PanelMode>("add");
    const [saving, setSaving] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [dName, setDName] = useState("");
    const [dAbout, setDAbout] = useState("");
    const [dImage, setDImage] = useState("");
    const [dRank, setDRank] = useState("");
    const [formError, setFormError] = useState("");

    useEffect(() => {
        axios.get(GET_BRANDS_URL).then(({ data }) => {
            if (data.brands) {
                setBrands(data.brands.map((b: { id: number; name: string; about: string; image?: string; rank?: number }) => ({
                    id: b.id,
                    name: b.name,
                    about: b.about,
                    image: b.image || "/images/home.png",
                    rank: b.rank ?? null,
                })));
            }
        }).catch(() => {});
    }, []);

    // brands with rank 1-6, sorted by rank
    const rankedBrands = brands
        .filter(b => b.rank != null && b.rank >= 1 && b.rank <= 6)
        .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));

    // fill up to 6 slots with fallbacks
    const displayed: DisplayBrand[] = [...rankedBrands];
    let fi = 0;
    while (displayed.length < 6) { displayed.push(FALLBACK[fi++]); }

    const canDelete = rankedBrands.length > 6;

    const openAdd = () => {
        setPanelMode("add");
        setEditingId(null);
        setDName(""); setDAbout(""); setDImage(""); setDRank("");
        setFormError("");
        setPanelOpen(true);
    };

    const openEdit = (b: Brand) => {
        setPanelMode("edit");
        setEditingId(b.id);
        setDName(b.name);
        setDAbout(b.about);
        setDImage(b.image === "/images/home.png" ? "" : b.image);
        setDRank(b.rank != null ? String(b.rank) : "");
        setFormError("");
        setPanelOpen(true);
    };

    const handleSave = async () => {
        if (!dName.trim() || !dAbout.trim()) { setFormError("Name and tagline are required"); return; }
        const rankNum = dRank.trim() ? Number(dRank.trim()) : null;
        if (dRank.trim() && (isNaN(rankNum!) || rankNum! < 1)) { setFormError("Rank must be a positive number"); return; }
        setFormError("");
        setSaving(true);
        try {
            const payload: Record<string, unknown> = {
                name: dName.trim(),
                about: dAbout.trim(),
                image: dImage.trim() || undefined,
                rank: rankNum,
            };
            if (panelMode === "edit" && editingId) payload.id = editingId;

            const { data } = await axios.post(UPSERT_BRAND_URL, payload, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                const b = data.brand;
                const updated: Brand = { id: b.id, name: b.name, about: b.about, image: b.image || "/images/home.png", rank: b.rank ?? null };
                setBrands(prev =>
                    panelMode === "edit"
                        ? prev.map(x => x.id === b.id ? updated : x)
                        : [...prev, updated]
                );
                setPanelOpen(false);
                toast.success(panelMode === "edit" ? `${b.name} updated!` : `${b.name} added!`);
            }
        } catch { toast.error("Failed to save brand."); }
        finally { setSaving(false); }
    };

    const handleDelete = async (b: Brand) => {
        if (!canDelete) { toast.error("Need at least 6 ranked brands — add more before deleting."); return; }
        try {
            await axios.delete(REMOVE_BRAND_URL, { data: { id: b.id }, headers: { Authorization: `Bearer ${token}` } });
            setBrands(prev => prev.filter(x => x.id !== b.id));
            toast.success(`${b.name} removed.`);
        } catch { toast.error("Failed to delete brand."); }
    };

    return (
        <div className="relative flex flex-col w-full max-w-7xl mt-20 sm:mt-28 lg:mt-40 mx-auto gap-y-6 sm:gap-y-8">
            {isAdmin && (
                <EditPanel
                    title={panelMode === "add" ? "Add Brand" : `Edit — ${dName}`}
                    isOpen={panelOpen}
                    onOpen={openAdd}
                    onClose={() => setPanelOpen(false)}
                    onSave={handleSave}
                    saving={saving}
                    showTrigger={false}
                >
                    <div><FieldLabel>Brand Name *</FieldLabel><FieldInput value={dName} onChange={v => { setDName(v); setFormError(""); }} placeholder="e.g. Arte Milano" /></div>
                    <div><FieldLabel>Tagline *</FieldLabel><FieldInput value={dAbout} onChange={v => { setDAbout(v); setFormError(""); }} placeholder="e.g. Luxury Italian wallpapers" /></div>
                    <div><FieldLabel>Image</FieldLabel><ImageUploadInput value={dImage} onChange={setDImage} /></div>
                    <div>
                        <FieldLabel>Home Page Rank (1–6)</FieldLabel>
                        <FieldInput value={dRank} onChange={v => { setDRank(v); setFormError(""); }} placeholder="e.g. 1  (leave blank to hide from home)" />
                        <p className="text-xs text-neutral-400 mt-1">Brands ranked 1–6 appear in the top brands section.</p>
                    </div>
                    {formError && <p className="text-xs text-red-500">{formError}</p>}
                </EditPanel>
            )}

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                <div className="text-4xl sm:text-5xl lg:text-6xl flex flex-col gap-y-2 sm:gap-y-3">
                    <span>Explore our top</span>
                    <span>brands</span>
                </div>
                <div className="flex flex-col sm:max-w-xl sm:justify-around gap-3">
                    <div className="flex flex-wrap gap-3 sm:justify-end">
                        <button
                            onClick={() => router.push("/inventory/brands")}
                            className="bg-black text-white flex px-4 py-2 items-center justify-center rounded-full group gap-x-2"
                        >
                            View all brands
                            <ChevronRight className="group-hover:translate-x-0.5 size-5 transition-transform duration-150" />
                        </button>
                        {isAdmin && (
                            <button
                                onClick={openAdd}
                                className="border-2 border-dashed border-neutral-400 text-neutral-600 flex px-4 py-2 items-center justify-center rounded-full gap-x-2 hover:border-neutral-700 hover:text-neutral-800 transition-all"
                            >
                                <Plus className="size-4" />
                                Add a Brand
                            </button>
                        )}
                    </div>
                    <div className="text-sm sm:text-base sm:text-end sm:max-w-sm">
                        Shop from a handpicked collection of trusted brands designed to bring you quality and style
                    </div>
                </div>
            </div>

            {/* Brand grid — 1 col mobile, 2 col sm, 3 col lg — with staggered heights on larger screens */}
            {/* Mobile/tablet: simple equal grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4 auto-rows-[220px]">
                {displayed.map((brand, i) => (
                    <BrandCard
                        key={isFallback(brand) ? `fb-${i}` : brand.id}
                        brand={brand}
                        isAdmin={isAdmin}
                        canDelete={canDelete}
                        onEdit={() => !isFallback(brand) && openEdit(brand as Brand)}
                        onDelete={() => !isFallback(brand) && handleDelete(brand as Brand)}
                    />
                ))}
            </div>

            {/* Desktop: original 3-column staggered layout */}
            <div className="hidden lg:flex w-full h-[760px] gap-x-4">
                <div className="w-full h-full flex flex-col gap-y-4">
                    <div className="h-[40%]">
                        <BrandCard brand={displayed[0]} isAdmin={isAdmin} canDelete={canDelete}
                            onEdit={() => !isFallback(displayed[0]) && openEdit(displayed[0] as Brand)}
                            onDelete={() => !isFallback(displayed[0]) && handleDelete(displayed[0] as Brand)} />
                    </div>
                    <div className="h-[60%]">
                        <BrandCard brand={displayed[1]} isAdmin={isAdmin} canDelete={canDelete}
                            onEdit={() => !isFallback(displayed[1]) && openEdit(displayed[1] as Brand)}
                            onDelete={() => !isFallback(displayed[1]) && handleDelete(displayed[1] as Brand)} />
                    </div>
                </div>
                <div className="w-full h-full flex flex-col gap-y-4">
                    <div className="h-[60%]">
                        <BrandCard brand={displayed[2]} isAdmin={isAdmin} canDelete={canDelete}
                            onEdit={() => !isFallback(displayed[2]) && openEdit(displayed[2] as Brand)}
                            onDelete={() => !isFallback(displayed[2]) && handleDelete(displayed[2] as Brand)} />
                    </div>
                    <div className="h-[40%]">
                        <BrandCard brand={displayed[3]} isAdmin={isAdmin} canDelete={canDelete}
                            onEdit={() => !isFallback(displayed[3]) && openEdit(displayed[3] as Brand)}
                            onDelete={() => !isFallback(displayed[3]) && handleDelete(displayed[3] as Brand)} />
                    </div>
                </div>
                <div className="w-full h-full flex flex-col gap-y-4">
                    <div className="h-[40%]">
                        <BrandCard brand={displayed[4]} isAdmin={isAdmin} canDelete={canDelete}
                            onEdit={() => !isFallback(displayed[4]) && openEdit(displayed[4] as Brand)}
                            onDelete={() => !isFallback(displayed[4]) && handleDelete(displayed[4] as Brand)} />
                    </div>
                    <div className="h-[60%]">
                        <BrandCard brand={displayed[5]} isAdmin={isAdmin} canDelete={canDelete}
                            onEdit={() => !isFallback(displayed[5]) && openEdit(displayed[5] as Brand)}
                            onDelete={() => !isFallback(displayed[5]) && handleDelete(displayed[5] as Brand)} />
                    </div>
                </div>
            </div>
        </div>
    );
}
