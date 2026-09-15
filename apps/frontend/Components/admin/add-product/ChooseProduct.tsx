"use client";

import { useAddProductStore } from "@/store/useAddProductStore";
import { useEffect, useState } from "react";
import axios from "axios";
import { GET_PRODUCT_TYPES_URL } from "@/routes/routes";

interface ProductType {
    id: number;
    name: string;
}

export default function ChooseProduct() {
    const [productTypes, setProductTypes] = useState<ProductType[]>([]);
    const { product, updateProduct } = useAddProductStore();

    useEffect(() => {
        axios.get(GET_PRODUCT_TYPES_URL)
            .then((res) => setProductTypes(res.data.productTypes ?? []))
            .catch(() => console.error("Failed to fetch product types"));
    }, []);

    return (
        <div className="text-[#3D5A40] bg-[#F9FAF8] p-4 sm:p-6 rounded-xl shadow-sm w-full max-w-3xl">
            <div className="flex flex-col items-start mb-6">
                <div className="font-bold text-xl sm:text-2xl md:text-3xl">Choose a Product</div>
                <div className="text-[#6D7278] text-sm sm:text-base mt-1">
                    Choose a type that fits your product well.
                </div>
            </div>

            <div className="w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {productTypes.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => updateProduct({ productTypeId: type.id, productTypeName: type.name })}
                        className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-md text-sm sm:text-md font-medium transition-all duration-200 border
              ${product.productTypeId === type.id
                                ? "bg-[#6DA165] text-white border-[#6DA165] shadow"
                                : "bg-white text-[#3D5A40] border-[#D1D5DB] hover:bg-[#f1f5f3]"
                            }`}
                    >
                        {type.name}
                    </button>
                ))}
                {productTypes.length === 0 && (
                    <p className="text-[#6D7278] col-span-1 xs:col-span-2 sm:col-span-3">No product types found. Add some via the admin panel.</p>
                )}
            </div>
        </div>
    );
}
