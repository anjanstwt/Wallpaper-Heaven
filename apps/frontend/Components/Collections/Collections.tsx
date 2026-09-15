"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { DirectionAwareHover } from "../../Components/ui/direction-aware-hover";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import Image from "next/image";
import { IconPencil, IconX, IconEdit, IconPlus } from "@tabler/icons-react";
import EditPanel, { FieldInput, FieldLabel, FieldTextarea } from "@/Components/admin/EditPanel";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { handleUpload } from "@/lib/s3-uploads";
import {
    GET_PRODUCT_TYPES_URL,
    PRODUCTS_BY_TYPE_URL,
    GET_FEATURED_PRODUCTS_URL,
    GET_SITE_SECTION_URL,
    UPSERT_SITE_SECTION_URL,
    UPDATE_PRODUCT_BASICS_URL,
} from "@/routes/routes";

gsap.registerPlugin(ScrollTrigger);

const MAX_PRODUCTS = 7;
const MAX_IMAGES = 8;

type ProductType = { id: number; name: string };
type Product = { id: number; name: string; images: string[]; tags: { id: number; name: string }[] };

const FALLBACK: Product[] = [
    { id: -1, name: "Botanicals", images: ["/col1.jpeg"], tags: [{ id: -1, name: "Floral" }] },
    { id: -2, name: "Modern Geometric", images: ["/col2.jpeg"], tags: [{ id: -2, name: "Minimalist" }] },
    { id: -3, name: "Baroque Revival", images: ["/col3.jpeg"], tags: [{ id: -3, name: "Classic" }] },
    { id: -4, name: "Pastel Dreams", images: ["/col4.jpeg"], tags: [{ id: -4, name: "Abstract" }] },
];

const DEFAULT_TITLE = "Featured Collections";
const DEFAULT_SUBTITLE = "Explore our selection of premium wallpapers, designed to transform any space into a stunning environment.";

export default function TopCollections() {
    const router = useRouter();
    const gridRef = useRef<HTMLDivElement>(null);
    const { isAdmin } = useAdminCheck();
    const editFileInputRef = useRef<HTMLInputElement>(null);
    const [editSlotIndex, setEditSlotIndex] = useState(0);

    const [title, setTitle] = useState(DEFAULT_TITLE);
    const [subtitle, setSubtitle] = useState(DEFAULT_SUBTITLE);
    const [productTypes, setProductTypes] = useState<ProductType[]>([]);
    const [products, setProducts] = useState<Product[]>(FALLBACK);
    const [activeTypeId, setActiveTypeId] = useState<number | null>(null);

    // Section heading edit panel
    const [panelOpen, setPanelOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [dTitle, setDTitle] = useState(title);
    const [dSubtitle, setDSubtitle] = useState(subtitle);

    // Product edit panel
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [editPanelOpen, setEditPanelOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [editImages, setEditImages] = useState<string[]>([]);
    const [editSaving, setEditSaving] = useState(false);

    useEffect(() => {
        axios.get(`${GET_SITE_SECTION_URL}?key=home-collections`).then(({ data }) => {
            if (data.section?.title) setTitle(data.section.title);
            if (data.section?.subtitle) setSubtitle(data.section.subtitle);
        }).catch(() => {});

        axios.get(GET_PRODUCT_TYPES_URL).then(({ data }) => {
            if (data.productTypes?.length) setProductTypes(data.productTypes);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (activeTypeId === null) {
            axios.get(`${GET_FEATURED_PRODUCTS_URL}?limit=${MAX_PRODUCTS}`).then(({ data }) => {
                setProducts(data.products?.length ? data.products.slice(0, MAX_PRODUCTS) : FALLBACK);
            }).catch(() => {});
        } else {
            axios.get(`${PRODUCTS_BY_TYPE_URL}?productTypeId=${activeTypeId}`).then(({ data }) => {
                setProducts(data.products?.length ? data.products.slice(0, MAX_PRODUCTS) : []);
            }).catch(() => {});
        }
    }, [activeTypeId]);

    useEffect(() => {
        if (!gridRef.current) return;
        const cards = gridRef.current.querySelectorAll(".wallpaper-card");
        cards.forEach((card) => {
            gsap.fromTo(card,
                { opacity: 0, y: 40, scale: 0.96 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: 0.55, ease: "power2.out",
                    scrollTrigger: { trigger: card, start: "top 82%", toggleActions: "play none none reverse" },
                }
            );
        });
    }, [products]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post(
                UPSERT_SITE_SECTION_URL,
                { key: "home-collections", title: dTitle, subtitle: dSubtitle }
            );
            setTitle(dTitle); setSubtitle(dSubtitle);
            setPanelOpen(false);
            toast.success("Section updated!");
        } catch { toast.error("Save failed."); }
        finally { setSaving(false); }
    };

    const openProductEdit = (product: Product) => {
        setEditProduct(product);
        setEditName(product.name);
        setEditImages(product.images.filter(Boolean));
        setEditPanelOpen(true);
    };

    const triggerEditUpload = (index: number) => {
        setEditSlotIndex(index);
        editFileInputRef.current?.click();
    };

    const onEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const toastId = toast.loading("Uploading image…");
        const url = await handleUpload(file);
        toast.dismiss(toastId);
        if (!url) { toast.error("Upload failed."); return; }
        setEditImages(prev => {
            const updated = [...prev];
            if (editSlotIndex < prev.length) updated[editSlotIndex] = url;
            else updated.push(url);
            return updated;
        });
        if (editFileInputRef.current) editFileInputRef.current.value = "";
        toast.success("Image uploaded!");
    };

    const handleProductSave = async () => {
        if (!editProduct) return;
        const validImages = editImages.filter(Boolean);
        if (!editName.trim()) { toast.error("Product name is required."); return; }
        if (validImages.length === 0) { toast.error("At least one image is required."); return; }
        setEditSaving(true);
        try {
            await axios.post(
                UPDATE_PRODUCT_BASICS_URL,
                { id: editProduct.id, name: editName.trim(), images: validImages }
            );
            setProducts(prev => prev.map(p =>
                p.id === editProduct.id ? { ...p, name: editName.trim(), images: validImages } : p
            ));
            setEditPanelOpen(false);
            toast.success("Product updated!");
        } catch { toast.error("Failed to save product."); }
        finally { setEditSaving(false); }
    };

    return (
        <section id="collections" className="py-16 px-4 sm:px-6 lg:px-0 mt-20 relative z-30">
            <input ref={editFileInputRef} type="file" accept="image/*" className="hidden" onChange={onEditFileChange} />

            {/* Section heading edit panel */}
            {isAdmin && (
                <EditPanel
                    title="Edit Section"
                    isOpen={panelOpen}
                    onOpen={() => { setDTitle(title); setDSubtitle(subtitle); setPanelOpen(true); }}
                    onClose={() => setPanelOpen(false)}
                    onSave={handleSave}
                    saving={saving}
                >
                    <div><FieldLabel>Section Title</FieldLabel><FieldInput value={dTitle} onChange={setDTitle} placeholder={DEFAULT_TITLE} /></div>
                    <div><FieldLabel>Subtitle</FieldLabel><FieldTextarea value={dSubtitle} onChange={setDSubtitle} placeholder={DEFAULT_SUBTITLE} rows={3} /></div>
                </EditPanel>
            )}

            {/* Product edit panel */}
            {isAdmin && (
                <EditPanel
                    title={`Edit: ${editProduct?.name ?? "Product"}`}
                    isOpen={editPanelOpen}
                    onOpen={() => {}}
                    onClose={() => setEditPanelOpen(false)}
                    onSave={handleProductSave}
                    saving={editSaving}
                    showTrigger={false}
                >
                    <div>
                        <FieldLabel>Product Name</FieldLabel>
                        <FieldInput value={editName} onChange={setEditName} placeholder="Product name" />
                    </div>
                    <div>
                        <FieldLabel>Images</FieldLabel>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {editImages.map((img, i) => (
                                <div key={i} className="relative group/imgslot h-[72px] w-[72px] rounded-lg overflow-hidden border border-neutral-200 flex-shrink-0">
                                    <Image src={img} alt={`Image ${i + 1}`} fill className="object-cover" unoptimized />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/imgslot:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                        <button onClick={() => triggerEditUpload(i)} title="Replace" className="bg-white p-1.5 rounded-full hover:scale-110 transition-transform">
                                            <IconEdit size={11} className="text-neutral-700" />
                                        </button>
                                        <button onClick={() => setEditImages(prev => prev.filter((_, idx) => idx !== i))} title="Remove" className="bg-white p-1.5 rounded-full hover:scale-110 transition-transform">
                                            <IconX size={11} className="text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {editImages.length < MAX_IMAGES && (
                                <button
                                    onClick={() => triggerEditUpload(editImages.length)}
                                    className="h-[72px] w-[72px] rounded-lg border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center gap-0.5 hover:border-neutral-500 hover:bg-neutral-50 transition-all flex-shrink-0"
                                >
                                    <IconPlus size={14} className="text-neutral-400" />
                                    <span className="text-[9px] text-neutral-400">Add</span>
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-neutral-400 mt-2">First image is the cover. Max {MAX_IMAGES} images.</p>
                    </div>
                </EditPanel>
            )}

            <div className="container mx-auto">
                <h2 className="text-3xl sm:text-4xl md:text-5xl text-center mb-4 font-semibold">
                    {title}
                </h2>
                <p className="text-neutral-500 font-light text-base sm:text-lg text-center mb-10 max-w-2xl mx-auto">
                    {subtitle}
                </p>

                {/* Filter tabs + admin add capsule */}
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    <button
                        onClick={() => setActiveTypeId(null)}
                        className={`px-5 py-2 rounded-[8px] text-sm font-medium transition-all duration-300 ${
                            activeTypeId === null
                                ? "bg-black text-white shadow-md"
                                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                        }`}
                    >
                        All
                    </button>
                    {productTypes.map(pt => (
                        <button
                            key={pt.id}
                            onClick={() => setActiveTypeId(pt.id)}
                            className={`px-5 py-2 rounded-[8px] text-sm font-medium transition-all duration-300 ${
                                activeTypeId === pt.id
                                    ? "bg-black text-white shadow-md"
                                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                            }`}
                        >
                            {pt.name}
                        </button>
                    ))}
                    {isAdmin && (
                        <button
                            onClick={() => router.push("/admin/add-product")}
                            className="px-5 py-2 rounded-[8px] text-sm font-medium border-2 border-dashed border-neutral-400 text-neutral-500 hover:border-neutral-600 hover:text-neutral-700 flex items-center gap-1.5 transition-all duration-300"
                        >
                            <IconPlus size={14} />
                            Add Product
                        </button>
                    )}
                </div>

                {/* Product grid */}
                <div
                    ref={gridRef}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8 place-items-center"
                >
                    {products.length === 0 ? (
                        <p className="col-span-2 sm:col-span-3 lg:col-span-4 text-center text-neutral-400 py-10">No products found in this category.</p>
                    ) : products.map((product) => (
                        <div key={product.id} className="wallpaper-card w-full relative group/card">
                            <div
                                className="cursor-pointer"
                                onClick={() => product.id > 0 && router.push(`/product/${product.id}`)}
                            >
                                <DirectionAwareHover
                                    imageUrl={product.images[0] || "/col1.jpeg"}
                                    className="w-full max-w-[160px] sm:max-w-[280px] md:max-w-[320px] h-auto aspect-[4/5] rounded-2xl shadow-md"
                                    imageClassName="object-cover"
                                >
                                    <div className="space-y-1 text-center px-2">
                                        <h3 className="text-lg sm:text-xl font-semibold leading-tight">{product.name}</h3>
                                        {product.tags.length > 0 && (
                                            <p className="text-sm opacity-75">{product.tags.map(t => t.name).join(", ")}</p>
                                        )}
                                    </div>
                                </DirectionAwareHover>
                            </div>

                            {isAdmin && product.id > 0 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); openProductEdit(product); }}
                                    title="Edit product"
                                    className="absolute top-2 right-2 z-50 opacity-0 group-hover/card:opacity-100 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all duration-200 hover:scale-110"
                                >
                                    <IconPencil size={14} className="text-neutral-700" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="text-center mt-10 sm:mt-12">
                    <button
                        onClick={() => router.push("/inventory/collections")}
                        className="bg-black px-6 py-3 rounded-full text-white text-base font-medium tracking-wide border-2 border-black hover:bg-white hover:text-black transition-all duration-300 shadow-md"
                    >
                        View all collections
                    </button>
                </div>
            </div>
        </section>
    );
}
