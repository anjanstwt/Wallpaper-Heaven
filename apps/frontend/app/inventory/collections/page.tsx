"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { gsap } from "gsap";
import { Pencil, Plus, X } from "lucide-react";
import { toast } from "sonner";
import NavbarMain from "@/Components/Nav-Bar/NavbarMain";
import EditPanel, { FieldInput, FieldLabel } from "@/Components/admin/EditPanel";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { handleUpload } from "@/lib/s3-uploads";
import {
    GET_PRODUCT_TYPES_URL,
    PRODUCTS_BY_TYPE_URL,
    GET_FEATURED_PRODUCTS_URL,
    UPDATE_PRODUCT_BASICS_URL,
} from "@/routes/routes";

const MAX_IMAGES = 8;

type Product = { id: number; name: string; images: string[]; tags?: { id: number; name: string }[] };
type ProductType = { id: number; name: string };

const DEMO_PRODUCTS: Product[] = [
    { id: -1,  name: "Nordic Minimal",         images: ["https://picsum.photos/seed/wp1/400/600"],  tags: [{ id: 1, name: "Minimal" }] },
    { id: -2,  name: "Tokyo Bloom",            images: ["https://picsum.photos/seed/wp2/400/600"],  tags: [{ id: 2, name: "Botanical" }] },
    { id: -3,  name: "Abstract Horizon",        images: ["https://picsum.photos/seed/wp3/400/600"],  tags: [{ id: 3, name: "Abstract" }] },
    { id: -4,  name: "Velvet Dusk",            images: ["https://picsum.photos/seed/wp4/400/600"],  tags: [{ id: 4, name: "Luxury" }] },
    { id: -5,  name: "Coastal Breeze",         images: ["https://picsum.photos/seed/wp5/400/600"],  tags: [{ id: 5, name: "Nature" }] },
    { id: -6,  name: "Marble Luxe",            images: ["https://picsum.photos/seed/wp6/400/600"],  tags: [{ id: 6, name: "Texture" }] },
    { id: -7,  name: "Sakura Dreams",          images: ["https://picsum.photos/seed/wp7/400/600"],  tags: [{ id: 2, name: "Botanical" }] },
    { id: -8,  name: "Urban Grid",             images: ["https://picsum.photos/seed/wp8/400/600"],  tags: [{ id: 7, name: "Geometric" }] },
    { id: -9,  name: "Golden Ratio",           images: ["https://picsum.photos/seed/wp9/400/600"],  tags: [{ id: 6, name: "Texture" }] },
    { id: -10, name: "Midnight Foliage",       images: ["https://picsum.photos/seed/wp10/400/600"], tags: [{ id: 2, name: "Botanical" }] },
    { id: -11, name: "Desert Nomad",           images: ["https://picsum.photos/seed/wp11/400/600"], tags: [{ id: 5, name: "Nature" }] },
    { id: -12, name: "Parisian Haussmann",     images: ["https://picsum.photos/seed/wp12/400/600"], tags: [{ id: 8, name: "Architecture" }] },
    { id: -13, name: "Tropical Canopy",        images: ["https://picsum.photos/seed/wp13/400/600"], tags: [{ id: 2, name: "Botanical" }] },
    { id: -14, name: "Silhouette Study",       images: ["https://picsum.photos/seed/wp14/400/600"], tags: [{ id: 3, name: "Abstract" }] },
    { id: -15, name: "Travertine Blush",       images: ["https://picsum.photos/seed/wp15/400/600"], tags: [{ id: 6, name: "Texture" }] },
    { id: -16, name: "Willow at Dusk",         images: ["https://picsum.photos/seed/wp16/400/600"], tags: [{ id: 5, name: "Nature" }] },
    { id: -17, name: "Ink & Stone",            images: ["https://picsum.photos/seed/wp17/400/600"], tags: [{ id: 3, name: "Abstract" }] },
    { id: -18, name: "Celestial Atlas",        images: ["https://picsum.photos/seed/wp18/400/600"], tags: [{ id: 9, name: "Celestial" }] },
];

function SkeletonGrid() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] rounded-2xl bg-neutral-100" />
                    <div className="mt-3 space-y-2">
                        <div className="h-3.5 w-2/3 rounded-full bg-neutral-100" />
                        <div className="h-3 w-1/3 rounded-full bg-neutral-100" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function CollectionsPage() {
    const router = useRouter();
    const { isAdmin } = useAdminCheck();
    const gridRef = useRef<HTMLDivElement>(null);
    const tabsRef = useRef<HTMLDivElement>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);

    const DEMO_TYPES: ProductType[] = [
        { id: -1, name: "Wallpapers" }, { id: -2, name: "Curtains" },
        { id: -3, name: "Blinds" }, { id: -4, name: "Rugs" }, { id: -5, name: "Cushions" },
    ];

    const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);
    const [productTypes, setProductTypes] = useState<ProductType[]>(DEMO_TYPES);
    const [activeTypeId, setActiveTypeId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    // Edit product panel
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [editPanelOpen, setEditPanelOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [editImages, setEditImages] = useState<string[]>([]);
    const [editSaving, setEditSaving] = useState(false);
    const [editSlotIndex, setEditSlotIndex] = useState(-1);
    const [uploadingSlot, setUploadingSlot] = useState(-1);

    useEffect(() => {
        axios.get(GET_PRODUCT_TYPES_URL)
            .then(({ data }) => {
                const result = data.productTypes ?? [];
                if (result.length > 0) setProductTypes(result);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        setLoading(true);
        const url = activeTypeId === null
            ? `${GET_FEATURED_PRODUCTS_URL}?limit=100`
            : `${PRODUCTS_BY_TYPE_URL}?productTypeId=${activeTypeId}`;
        axios.get(url)
            .then(({ data }) => {
                const result = data.products ?? [];
                if (result.length > 0) setProducts(result);
                else setProducts(DEMO_PRODUCTS);
            })
            .catch(() => setProducts(DEMO_PRODUCTS))
            .finally(() => setLoading(false));
    }, [activeTypeId]);

    useEffect(() => {
        if (loading || !gridRef.current) return;
        gsap.fromTo(
            gridRef.current.querySelectorAll(".product-card"),
            { opacity: 0, y: 28, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, stagger: 0.045, duration: 0.5, ease: "power3.out" }
        );
    }, [products, loading]);

    const scrollTabsLeft = () => tabsRef.current?.scrollBy({ left: -200, behavior: "smooth" });
    const scrollTabsRight = () => tabsRef.current?.scrollBy({ left: 200, behavior: "smooth" });

    const openProductEdit = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        setEditProduct(product);
        setEditName(product.name);
        setEditImages([...product.images]);
        setEditPanelOpen(true);
    };

    const triggerSlotUpload = (index: number) => {
        setEditSlotIndex(index);
        editFileInputRef.current?.click();
    };

    const onEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingSlot(editSlotIndex);
        const url = await handleUpload(file);
        if (url) {
            setEditImages(prev => {
                const next = [...prev];
                if (editSlotIndex < next.length) next[editSlotIndex] = url;
                else next.push(url);
                return next;
            });
        } else {
            toast.error("Image upload failed.");
        }
        setUploadingSlot(-1);
        e.target.value = "";
    };

    const removeEditImage = (index: number) => {
        if (editImages.length <= 1) return;
        setEditImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleProductSave = async () => {
        if (!editProduct || !editName.trim() || editImages.length === 0) {
            toast.error("Name and at least one image are required.");
            return;
        }
        setEditSaving(true);
        try {
            const { data } = await axios.post(
                UPDATE_PRODUCT_BASICS_URL,
                { id: editProduct.id, name: editName.trim(), images: editImages }
            );
            if (data.success) {
                setProducts(prev =>
                    prev.map(p => p.id === editProduct.id
                        ? { ...p, name: editName.trim(), images: editImages }
                        : p
                    )
                );
                setEditPanelOpen(false);
                toast.success("Product updated!");
            }
        } catch { toast.error("Failed to update product."); }
        finally { setEditSaving(false); }
    };

    return (
        <div className="min-h-screen bg-white">
            <NavbarMain />

            {/* Admin edit panel */}
            {isAdmin && (
                <>
                    <EditPanel
                        title={editProduct ? `Edit: ${editProduct.name}` : "Edit Product"}
                        isOpen={editPanelOpen}
                        onOpen={() => {}}
                        onClose={() => setEditPanelOpen(false)}
                        onSave={handleProductSave}
                        saving={editSaving}
                        showTrigger={false}
                    >
                        <div>
                            <FieldLabel>Product Name *</FieldLabel>
                            <FieldInput value={editName} onChange={setEditName} placeholder="Product name" />
                        </div>

                        <div>
                            <FieldLabel>Images ({editImages.length}/{MAX_IMAGES})</FieldLabel>
                            <div className="grid grid-cols-4 gap-2 mt-1">
                                {editImages.map((img, i) => (
                                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden group/slot border border-neutral-100">
                                        {uploadingSlot === i ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                                                <div className="w-5 h-5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        ) : (
                                            <>
                                                <Image src={img} alt="" fill className="object-cover" unoptimized />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/slot:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => triggerSlotUpload(i)}
                                                        className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center"
                                                    >
                                                        <Pencil className="w-3 h-3 text-neutral-700" />
                                                    </button>
                                                    {editImages.length > 1 && (
                                                        <button
                                                            onClick={() => removeEditImage(i)}
                                                            className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center"
                                                        >
                                                            <X className="w-3 h-3 text-red-500" />
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                                {editImages.length < MAX_IMAGES && (
                                    <button
                                        onClick={() => triggerSlotUpload(editImages.length)}
                                        className="aspect-square rounded-lg border-2 border-dashed border-neutral-200 hover:border-[#6DA165] flex items-center justify-center text-neutral-400 hover:text-[#6DA165] transition-colors"
                                    >
                                        {uploadingSlot === editImages.length
                                            ? <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                                            : <Plus className="w-5 h-5" />
                                        }
                                    </button>
                                )}
                            </div>
                        </div>
                    </EditPanel>
                    <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onEditFileChange}
                    />
                </>
            )}

            <div className="pt-[72px]">
                {/* Page heading */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-5">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight">Collections</h1>
                            <p className="text-neutral-400 mt-2 text-base">
                                {loading ? "Loading…" : `${products.length} wallpaper${products.length !== 1 ? "s" : ""}`}
                            </p>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={() => router.push("/admin/add-product")}
                                className="self-start sm:self-auto flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Product
                            </button>
                        )}
                    </div>
                </div>

                {/* Sticky filter bar */}
                <div className="sticky top-[72px] z-[50] bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2">
                        <button
                            onClick={scrollTabsLeft}
                            className="flex-shrink-0 w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 text-xs transition-colors"
                        >
                            ‹
                        </button>
                        <div
                            ref={tabsRef}
                            className="flex gap-2 overflow-x-auto flex-1"
                            style={{ scrollbarWidth: "none" }}
                        >
                            {[{ id: null as number | null, name: "All" }, ...productTypes].map((tab) => (
                                <button
                                    key={tab.id ?? "all"}
                                    onClick={() => {
                                        if (tab.id === null) {
                                            setActiveTypeId(null);
                                        } else {
                                            router.push(`/inventory/collections/${tab.name.toLowerCase().replace(/\s+/g, "-")}`);
                                        }
                                    }}
                                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                                        activeTypeId === tab.id
                                            ? "bg-black text-white shadow-sm"
                                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                    }`}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={scrollTabsRight}
                            className="flex-shrink-0 w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 text-xs transition-colors"
                        >
                            ›
                        </button>
                    </div>
                </div>

                {/* Product grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
                    {loading ? (
                        <SkeletonGrid />
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center text-3xl mb-6">🎨</div>
                            <p className="text-2xl font-semibold text-neutral-800">Nothing here yet</p>
                            <p className="text-neutral-400 mt-2 max-w-xs">Try a different category or check back soon.</p>
                        </div>
                    ) : (
                        <div
                            ref={gridRef}
                            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
                        >
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="product-card group/card cursor-pointer"
                                    onClick={() => router.push(`/product/${product.id}`)}
                                >
                                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100 shadow-sm">
                                        <Image
                                            src={product.images[0] || "/col1.jpeg"}
                                            alt={product.name}
                                            fill
                                            className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-[1.05]"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                                        <div className="absolute inset-x-4 bottom-4 translate-y-3 opacity-0 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-300 delay-75">
                                            <p className="text-white font-semibold text-sm sm:text-base leading-snug line-clamp-2">
                                                {product.name}
                                            </p>
                                            {product.tags && product.tags.length > 0 && (
                                                <p className="text-white/60 text-xs mt-1 line-clamp-1">
                                                    {product.tags.map(t => t.name).join(" · ")}
                                                </p>
                                            )}
                                        </div>

                                        {/* Admin pencil */}
                                        {isAdmin && (
                                            <button
                                                onClick={(e) => openProductEdit(e, product)}
                                                className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-white/50 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 shadow-sm hover:scale-110 active:scale-95"
                                            >
                                                <Pencil className="w-3.5 h-3.5 text-neutral-700" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="mt-2.5 text-sm font-medium text-neutral-800 line-clamp-1 px-0.5">
                                        {product.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
