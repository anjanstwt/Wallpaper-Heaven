"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAddProductStore } from "@/store/useAddProductStore";
import { GET_BRANDS_URL } from "@/routes/routes";

interface Brand {
    id: number;
    name: string;
}

export default function SetDetails() {
    const { product, updateProduct } = useAddProductStore();
    const [brandQuery, setBrandQuery] = useState(product.brandName || "");
    const [brandResults, setBrandResults] = useState<Brand[]>([]);
    const [showBrandDropdown, setShowBrandDropdown] = useState(false);

    useEffect(() => {
        setBrandQuery(product.brandName || "");
    }, [product.brandName]);

    const searchBrand = async () => {
        try {
            const { data } = await axios.get(GET_BRANDS_URL);
            const brands: Brand[] = data.brands ?? [];
            const filtered = brands.filter((b) =>
                b.name.toLowerCase().includes(brandQuery.toLowerCase())
            );
            setBrandResults(filtered);
            setShowBrandDropdown(true);
        } catch {
            console.error("Failed to search brands");
        }
    };

    const selectBrand = (brand: Brand) => {
        updateProduct({ brandId: brand.id, brandName: brand.name });
        setBrandQuery(brand.name);
        setShowBrandDropdown(false);
    };

    return (
        <div className="text-[#3D5A40] bg-[#F9FAF8] p-4 sm:p-6 rounded-xl shadow-sm w-full max-w-2xl">
            <div className="flex flex-col items-start mb-6">
                <div className="font-bold text-xl sm:text-2xl md:text-3xl">Set Details</div>
                <div className="text-[#6D7278] text-sm sm:text-base mt-1">
                    Give your product some details.
                </div>
            </div>

            <div className="flex flex-col gap-y-4">
                {/* Title Input */}
                <div className="w-full">
                    <label className="font-semibold text-[#3D5A40] mb-1 block">Title</label>
                    <input
                        type="text"
                        value={product.title}
                        onChange={(e) => updateProduct({ title: e.target.value })}
                        placeholder="Product title"
                        className="w-full border border-[#D1D5DB] bg-white text-[#3D5A40] placeholder-gray-400 rounded-full px-5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#6DA165] transition-all"
                    />
                </div>

                {/* Description Input */}
                <div className="w-full">
                    <label className="font-semibold text-[#3D5A40] mb-1 block">Description</label>
                    <textarea
                        value={product.description}
                        onChange={(e) => updateProduct({ description: e.target.value })}
                        placeholder="Write a short description..."
                        className="w-full border border-[#D1D5DB] bg-white text-[#3D5A40] placeholder-gray-400 rounded-lg px-5 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-[#6DA165] transition-all"
                        rows={4}
                    />
                </div>

                {/* Brand Search */}
                <div className="w-full relative">
                    <label className="font-semibold text-[#3D5A40] mb-1 block">Brand Name</label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <input
                            type="text"
                            value={brandQuery}
                            onChange={(e) => {
                                setBrandQuery(e.target.value);
                                if (!e.target.value) updateProduct({ brandId: null, brandName: "" });
                            }}
                            placeholder="Search brand..."
                            className="flex-1 border border-[#D1D5DB] bg-white text-[#3D5A40] placeholder-gray-400 rounded-full px-5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#6DA165] transition-all"
                        />
                        <button
                            onClick={searchBrand}
                            className="w-full sm:w-[120px] bg-[#6DA165] text-white px-5 py-3 rounded-full cursor-pointer font-medium hover:bg-[#5a914e] transition-colors"
                        >
                            Search
                        </button>
                    </div>

                    {showBrandDropdown && brandResults.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-[#D1D5DB] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {brandResults.map((brand) => (
                                <button
                                    key={brand.id}
                                    onClick={() => selectBrand(brand)}
                                    className="w-full text-left px-5 py-3 hover:bg-[#f1f5f3] text-[#3D5A40] transition-colors"
                                >
                                    {brand.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {showBrandDropdown && brandResults.length === 0 && (
                        <p className="text-sm text-[#6D7278] mt-1">No brands found. Create one first.</p>
                    )}

                    {product.brandId && (
                        <p className="text-sm text-[#6DA165] mt-1">Selected: {product.brandName}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
