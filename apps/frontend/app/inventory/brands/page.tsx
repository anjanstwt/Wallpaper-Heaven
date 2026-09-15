"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { gsap } from "gsap";
import { ArrowUpRight, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import NavbarMain from "@/Components/Nav-Bar/NavbarMain";
import EditPanel, { FieldInput, FieldLabel, FieldTextarea } from "@/Components/admin/EditPanel";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { handleUpload } from "@/lib/s3-uploads";
import { GET_BRANDS_URL, UPSERT_BRAND_URL, REMOVE_BRAND_URL } from "@/routes/routes";

type Brand = { id: number; name: string; about: string; image?: string; rank?: number | null };
type PanelMode = "add" | "edit";

const DEMO_BRANDS: Brand[] = [
    { id: -1,  name: "Arte Milano",        about: "Italian luxury wallcoverings since 1956",     image: "https://picsum.photos/seed/br1/900/600",  rank: 1 },
    { id: -2,  name: "Élitis Paris",       about: "Avant-garde textures from the French atelier", image: "https://picsum.photos/seed/br2/900/600",  rank: 2 },
    { id: -3,  name: "Nobilis",            about: "Timeless patterns for modern interiors",       image: "https://picsum.photos/seed/br3/900/600",  rank: 3 },
    { id: -4,  name: "De Gournay",         about: "Hand-painted silk wallcoverings",              image: "https://picsum.photos/seed/br4/900/600",  rank: 4 },
    { id: -5,  name: "Osborne & Little",   about: "British heritage prints & weaves",             image: "https://picsum.photos/seed/br5/900/600",  rank: 5 },
    { id: -6,  name: "Designers Guild",    about: "Bold colour and contemporary pattern",         image: "https://picsum.photos/seed/br6/900/600",  rank: 6 },
    { id: -7,  name: "Farrow & Ball",      about: "Richly pigmented paints and papers",           image: "https://picsum.photos/seed/br7/900/600" },
    { id: -8,  name: "Borastapeter",       about: "Swedish craftsmanship, Nordic sensibility",    image: "https://picsum.photos/seed/br8/900/600" },
    { id: -9,  name: "Harlequin",          about: "Joyful and playful contemporary designs",     image: "https://picsum.photos/seed/br9/900/600" },
    { id: -10, name: "Rasch",              about: "Affordable elegance, made in Germany",         image: "https://picsum.photos/seed/br10/900/600" },
    { id: -11, name: "Graham & Brown",     about: "Innovative prints for every room",             image: "https://picsum.photos/seed/br11/900/600" },
    { id: -12, name: "Cole & Son",         about: "Archival English wallpaper since 1873",        image: "https://picsum.photos/seed/br12/900/600" },
    { id: -13, name: "Sandberg",           about: "Scandinavian patterns with soul",              image: "https://picsum.photos/seed/br13/900/600" },
    { id: -14, name: "Muralunique",        about: "Bespoke photographic murals",                  image: "https://picsum.photos/seed/br14/900/600" },
    { id: -15, name: "Zinc Textile",       about: "Natural fibres and organic textures",          image: "https://picsum.photos/seed/br15/900/600" },
];

function BrandCard({
    brand,
    size = "normal",
    isAdmin,
    onClick,
    onEdit,
    onDelete,
    canDelete,
}: {
    brand: Brand;
    size?: "hero" | "medium" | "normal";
    isAdmin: boolean;
    onClick: () => void;
    onEdit: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
    canDelete: boolean;
}) {
    const heights = {
        hero: "h-[300px] sm:h-[400px] lg:h-[520px]",
        medium: "h-48 sm:h-64 lg:h-80",
        normal: "h-40 sm:h-52 lg:h-64",
    };

    return (
        <div
            className={`brand-card relative ${heights[size]} rounded-3xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-shadow duration-500`}
            onClick={onClick}
        >
            {brand.image ? (
                <Image
                    src={brand.image}
                    alt={brand.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    unoptimized
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-900" />
            )}

            {brand.rank != null && brand.rank <= 6 && (
                <div className="absolute top-4 left-4 z-10 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                    #{brand.rank}
                </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 lg:p-8">
                <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hidden sm:block">
                    {brand.about}
                </p>
                <div className="flex items-end justify-between">
                    <h3 className={`text-white font-semibold leading-tight ${size === "hero" ? "text-2xl sm:text-4xl lg:text-5xl" : size === "medium" ? "text-xl sm:text-2xl lg:text-3xl" : "text-lg sm:text-xl lg:text-2xl"}`}>
                        {brand.name}
                    </h3>
                    <div className="flex-shrink-0 ml-3 sm:ml-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                </div>
            </div>

            {/* Admin controls */}
            {isAdmin && (
                <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={onEdit}
                        className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                    >
                        <Pencil className="w-4 h-4 text-neutral-700" />
                    </button>
                    {canDelete && (
                        <button
                            onClick={onDelete}
                            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                        >
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function SkeletonBrand({ className }: { className?: string }) {
    return <div className={`animate-pulse rounded-3xl bg-neutral-100 ${className}`} />;
}

export default function BrandsPage() {
    const router = useRouter();
    const { isAdmin } = useAdminCheck();
    const sectionRef = useRef<HTMLDivElement>(null);
    const imageFileRef = useRef<HTMLInputElement>(null);
    const [brands, setBrands] = useState<Brand[]>(DEMO_BRANDS);
    const [loading, setLoading] = useState(true);

    // Panel
    const [panelOpen, setPanelOpen] = useState(false);
    const [panelMode, setPanelMode] = useState<PanelMode>("add");
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [bName, setBName] = useState("");
    const [bAbout, setBAbout] = useState("");
    const [bImage, setBImage] = useState("");
    const [bRank, setBRank] = useState("");
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        axios.get(GET_BRANDS_URL)
            .then(({ data }) => {
                const result = data.brands ?? [];
                if (result.length > 0) setBrands(result);
                else setBrands(DEMO_BRANDS);
            })
            .catch(() => setBrands(DEMO_BRANDS))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (loading || !sectionRef.current) return;
        gsap.fromTo(
            sectionRef.current.querySelectorAll(".brand-card"),
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: "power3.out" }
        );
    }, [brands, loading]);

    const openAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPanelMode("add");
        setEditingBrand(null);
        setBName(""); setBAbout(""); setBImage(""); setBRank("");
        setPanelOpen(true);
    };

    const openEdit = (e: React.MouseEvent, brand: Brand) => {
        e.stopPropagation();
        setPanelMode("edit");
        setEditingBrand(brand);
        setBName(brand.name);
        setBAbout(brand.about);
        setBImage(brand.image ?? "");
        setBRank(brand.rank != null ? String(brand.rank) : "");
        setPanelOpen(true);
    };

    const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImage(true);
        const url = await handleUpload(file);
        if (url) setBImage(url);
        else toast.error("Image upload failed.");
        setUploadingImage(false);
        e.target.value = "";
    };

    const handleSave = async () => {
        if (!bName.trim()) { toast.error("Brand name is required."); return; }
        setSaving(true);
        try {
            const payload: Record<string, unknown> = {
                name: bName.trim(),
                about: bAbout.trim(),
                image: bImage || undefined,
                rank: bRank ? Number(bRank) : undefined,
            };
            if (panelMode === "edit" && editingBrand) payload.id = editingBrand.id;

            const { data } = await axios.post(UPSERT_BRAND_URL, payload);

            if (data.success) {
                const brand: Brand = data.brand;
                if (panelMode === "add") {
                    setBrands(prev => [...prev, brand]);
                    toast.success(`${brand.name} added!`);
                } else {
                    setBrands(prev => prev.map(b => b.id === brand.id ? brand : b));
                    toast.success(`${brand.name} updated!`);
                }
                setPanelOpen(false);
            }
        } catch { toast.error("Failed to save brand."); }
        finally { setSaving(false); }
    };

    const handleDelete = (e: React.MouseEvent, brand: Brand) => {
        e.stopPropagation();
        toast(`Delete "${brand.name}"?`, {
            description: "This cannot be undone.",
            action: {
                label: "Delete",
                onClick: async () => {
                    try {
                        await axios.post(REMOVE_BRAND_URL, { id: brand.id });
                        setBrands(prev => prev.filter(b => b.id !== brand.id));
                        toast.success(`${brand.name} deleted.`);
                    } catch { toast.error("Failed to delete brand."); }
                },
            },
            cancel: { label: "Cancel", onClick: () => {} },
        });
    };

    const goToBrand = (brand: Brand) =>
        router.push(`/inventory/brands/${brand.name.toLowerCase().replace(/\s+/g, "-")}`);

    const heroBrand = brands[0];
    const twoColBrands = brands.slice(1, 3);
    const remainingBrands = brands.slice(3);

    return (
        <div className="min-h-screen bg-white">
            <style>{`
                @keyframes scroll-left {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                .marquee-track { animation: scroll-left 40s linear infinite; }
                .marquee-track:hover { animation-play-state: paused; }
            `}</style>

            <NavbarMain />

            {/* Admin panel */}
            {isAdmin && (
                <>
                    <EditPanel
                        title={panelMode === "add" ? "Add Brand" : `Edit: ${editingBrand?.name}`}
                        isOpen={panelOpen}
                        onOpen={() => {}}
                        onClose={() => setPanelOpen(false)}
                        onSave={handleSave}
                        saving={saving}
                        showTrigger={false}
                    >
                        <div>
                            <FieldLabel>Brand Name *</FieldLabel>
                            <FieldInput value={bName} onChange={setBName} placeholder="e.g. Arte Milano" />
                        </div>
                        <div>
                            <FieldLabel>About / Tagline</FieldLabel>
                            <FieldTextarea value={bAbout} onChange={setBAbout} placeholder="Short description…" rows={2} />
                        </div>
                        <div>
                            <FieldLabel>Image</FieldLabel>
                            <div
                                className="relative w-full h-36 rounded-xl overflow-hidden border-2 border-dashed border-neutral-200 cursor-pointer hover:border-[#6DA165] transition-colors"
                                onClick={() => imageFileRef.current?.click()}
                            >
                                {uploadingImage ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-50">
                                        <div className="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : bImage ? (
                                    <Image src={bImage} alt="preview" fill className="object-cover" unoptimized />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 gap-1">
                                        <Plus className="w-6 h-6" />
                                        <span className="text-xs">Click to upload</span>
                                    </div>
                                )}
                            </div>
                            <input ref={imageFileRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />
                        </div>
                        <div>
                            <FieldLabel>Rank (1–6 featured on home)</FieldLabel>
                            <FieldInput value={bRank} onChange={setBRank} placeholder="e.g. 1" />
                        </div>
                    </EditPanel>
                </>
            )}

            <div className="pt-[72px]">
                {/* Marquee ticker */}
                {!loading && brands.length > 0 && (
                    <div
                        className="overflow-hidden border-b border-neutral-100 py-4"
                        style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}
                    >
                        <div className="marquee-track flex whitespace-nowrap gap-10">
                            {[...brands, ...brands, ...brands, ...brands].map((brand, i) => (
                                <span key={i} className="inline-flex items-center gap-4 text-sm font-medium text-neutral-400 uppercase tracking-widest">
                                    {brand.name}
                                    <span className="w-1 h-1 rounded-full bg-neutral-300 inline-block" />
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
                    {/* Header */}
                    <div className="mb-10">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div>
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight">Our Brands</h1>
                                <p className="text-neutral-400 mt-2 text-sm sm:text-base">
                                    {loading ? "Loading…" : `${brands.length} brand${brands.length !== 1 ? "s" : ""} worldwide`}
                                </p>
                            </div>
                            {isAdmin && (
                                <button
                                    onClick={openAdd}
                                    className="self-start flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors flex-shrink-0"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Add Brand</span>
                                    <span className="sm:hidden">Add</span>
                                </button>
                            )}
                        </div>
                        {!loading && (
                            <p className="hidden sm:block text-sm text-neutral-400 max-w-md mt-2 leading-relaxed">
                                Luxury wallpaper houses trusted by interior designers around the globe
                            </p>
                        )}
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            <SkeletonBrand className="h-[300px] sm:h-[400px] lg:h-[520px]" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <SkeletonBrand className="h-48 sm:h-64 lg:h-80" />
                                <SkeletonBrand className="h-48 sm:h-64 lg:h-80" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <SkeletonBrand className="h-40 sm:h-52 lg:h-64" />
                                <SkeletonBrand className="h-40 sm:h-52 lg:h-64" />
                                <SkeletonBrand className="h-40 sm:h-52 lg:h-64" />
                            </div>
                        </div>
                    ) : brands.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center text-3xl mb-6">🏷️</div>
                            <p className="text-2xl font-semibold text-neutral-800">No brands yet</p>
                            <p className="text-neutral-400 mt-2">Brands will appear here once added.</p>
                        </div>
                    ) : (
                        <div ref={sectionRef} className="space-y-4">
                            {heroBrand && (
                                <BrandCard
                                    brand={heroBrand} size="hero" isAdmin={isAdmin}
                                    onClick={() => goToBrand(heroBrand)}
                                    onEdit={(e) => openEdit(e, heroBrand)}
                                    onDelete={(e) => handleDelete(e, heroBrand)}
                                    canDelete={brands.length > 1}
                                />
                            )}
                            {twoColBrands.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {twoColBrands.map(b => (
                                        <BrandCard key={b.id} brand={b} size="medium" isAdmin={isAdmin}
                                            onClick={() => goToBrand(b)}
                                            onEdit={(e) => openEdit(e, b)}
                                            onDelete={(e) => handleDelete(e, b)}
                                            canDelete={brands.length > 1}
                                        />
                                    ))}
                                </div>
                            )}
                            {remainingBrands.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {remainingBrands.map(b => (
                                        <BrandCard key={b.id} brand={b} size="normal" isAdmin={isAdmin}
                                            onClick={() => goToBrand(b)}
                                            onEdit={(e) => openEdit(e, b)}
                                            onDelete={(e) => handleDelete(e, b)}
                                            canDelete={brands.length > 1}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
