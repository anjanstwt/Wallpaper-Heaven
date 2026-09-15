"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Filter from "@/Components/InventoryPage/Filter/Filter";
import PhoneFilterTab from "@/Components/InventoryPage/Filter/PhoneFilterTab";
import ObjectInventory from "@/Components/InventoryPage/ObjectInventory/ObjectInventory";
import Top from "@/Components/InventoryPage/Top/Top";
import NavbarMain from "@/Components/Nav-Bar/NavbarMain";
import { PRODUCTS_BY_TYPE_URL, GET_PRODUCT_TYPES_URL } from "@/routes/routes";

interface Product {
    id: number;
    name: string;
    images: string[];
}

export default function Page() {
    const params = useParams();
    const typeParam = params?.type as string;

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!typeParam) return;

        const resolveAndFetch = async () => {
            try {
                // Resolve type slug/id to a numeric productTypeId
                let productTypeId: number | null = null;

                const numericId = parseInt(typeParam);
                if (!isNaN(numericId)) {
                    productTypeId = numericId;
                } else {
                    // typeParam is a name slug — look it up
                    const { data } = await axios.get(GET_PRODUCT_TYPES_URL);
                    const match = (data.productTypes ?? []).find(
                        (t: { id: number; name: string }) =>
                            t.name.toLowerCase().replace(/\s+/g, "-") === typeParam.toLowerCase()
                    );
                    if (match) productTypeId = match.id;
                }

                if (!productTypeId) {
                    setProducts([]);
                    return;
                }

                const { data } = await axios.get(`${PRODUCTS_BY_TYPE_URL}?productTypeId=${productTypeId}`);
                setProducts(data.products ?? []);
            } catch {
                console.error("Failed to fetch products");
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        resolveAndFetch();
    }, [typeParam]);

    return (
        <div className="min-h-screen w-full pt-[72px]">
            <NavbarMain />
            <div className="w-full flex flex-col gap-y-5 px-4 sm:px-6 md:px-10 lg:px-20 mb-20">
                <Top />
                <PhoneFilterTab />
                {loading ? (
                    <div className="flex justify-center py-20 text-gray-400">Loading...</div>
                ) : (
                    <div className="flex flex-col lg:flex-row justify-between gap-y-6 lg:gap-x-6 lg:pt-10">
                        <Filter />
                        <ObjectInventory products={products} />
                    </div>
                )}
            </div>
        </div>
    );
}
