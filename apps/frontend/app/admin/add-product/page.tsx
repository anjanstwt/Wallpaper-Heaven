"use client"
import { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import AddImage from "@/Components/admin/add-product/AddImage";
import ChooseProduct from "@/Components/admin/add-product/ChooseProduct";
import SetDetails from "@/Components/admin/add-product/SetDetails";
import SetTags from "@/Components/admin/add-product/SetTags";
import UserPageNavbar from "@/Components/Nav-Bar/UserPageNavbar";
import Button from "@/components/ui/Button";
import { useAddProductStore } from "@/store/useAddProductStore";
import { UPSERT_PRODUCT_URL } from "@/routes/routes";

export default function AddProduct() {
    const { data: session } = useSession();
    const { product, resetProduct } = useAddProductStore();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!session?.user) { toast.error("You must be logged in as admin."); return; }
        if (!product.productTypeId) { toast.error("Please select a product type."); return; }

        const validImages = product.images.filter(Boolean);
        if (validImages.length < 3) { toast.error("Please upload at least 3 images."); return; }
        if (!product.title || !product.description) { toast.error("Please fill in title and description."); return; }
        if (product.tagIds.length === 0) { toast.error("Please add at least one tag."); return; }

        try {
            setLoading(true);
            await axios.post(
                UPSERT_PRODUCT_URL,
                {
                    images: validImages,
                    name: product.title,
                    description: product.description,
                    productTypeId: product.productTypeId,
                    brandId: product.brandId,
                    creatorId: product.creatorId,
                    tagsId: product.tagIds,
                }
            );
            toast.success("Product added successfully!");
            resetProduct();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(msg || "Failed to add product.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-full">
            <UserPageNavbar />
            <div className="pt-[72px]">
                <div className="flex flex-col gap-y-8 sm:gap-y-10 px-4 sm:px-6 lg:px-10 py-8 mb-10 max-w-4xl mx-auto">
                    <ChooseProduct />
                    <AddImage />
                    <SetDetails />
                    <SetTags />
                    <div className="max-w-2xl flex justify-center items-center">
                        <Button onClick={handleSubmit}>
                            {loading ? "Submitting…" : "Submit"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
