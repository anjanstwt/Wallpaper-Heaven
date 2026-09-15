"use client";

import { useState } from "react";
import axios from "axios";
import DatePicker from "@/Components/ui/DatePicker";
import { useSession } from "next-auth/react";
import { headers } from "next/headers";

export default function OfferPanel({ adminId }: { adminId: string }) {
    const [tag, setTag] = useState<"Offer" | "New">("Offer");
    const [discount, setDiscount] = useState<string>("");
    const [productType, setProductType] = useState<string>("");
    const [itemName, setItemName] = useState<string>("");
    const [validTill, setValidTill] = useState<Date | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const { data: session } = useSession();

    const handleSubmit = async () => {
        if (!validTill) {
            setMessage("Please select a validTill date");
            return;
        }

        if(!session?.user.id) {
            setMessage("session not found");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const res = await axios.post("http://localhost:8080/offer/add-offer", {
                addedById: session.user.id,
                discount,
                productName: itemName,
                productType,
                validTill: validTill.toISOString(),
                badge: tag,
            });

            setMessage(res.data.message);

            setDiscount("");
            setProductType("");
            setItemName("");
            setValidTill(null);
            setTag("Offer");

        } catch (err: any) {
            console.error(err);
            setMessage(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded-md w-full max-w-md space-y-4">
            <div>
                <label className="block font-medium mb-1">Offer Type</label>
                <select
                    value={tag}
                    onChange={(e) => setTag(e.target.value as "Offer" | "New")}
                    className="border px-2 py-1 w-full"
                >
                    <option value="Offer">Offer</option>
                    <option value="New">New</option>
                </select>
            </div>

            <div>
                <label className="block font-medium mb-1">Product Type</label>
                <input
                    type="text"
                    value={productType}
                    placeholder="e.g. Curtain"
                    onChange={(e) => setProductType(e.target.value)}
                    className="border px-2 py-1 w-full"
                />
            </div>

            <div>
                <label className="block font-medium mb-1">Product Name</label>
                <input
                    type="text"
                    value={itemName}
                    placeholder="e.g. Cole & Sons"
                    onChange={(e) => setItemName(e.target.value)}
                    className="border px-2 py-1 w-full"
                />
            </div>

            <div>
                <label className="block font-medium mb-1">Discount</label>
                <input
                    type="text"
                    value={discount}
                    placeholder="e.g. 20% off"
                    onChange={(e) => setDiscount(e.target.value)}
                    className="border px-2 py-1 w-full"
                />
            </div>

            <div>
                <label className="block font-medium mb-1">Valid Till</label>
                <DatePicker date={validTill} onChange={setValidTill} />
            </div>

            <div className="w-full flex justify-center">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="py-2 px-5 rounded-full border border-black bg-black text-white hover:bg-neutral-800 transition-all duration-200"
                >
                    {loading ? "Submitting..." : "Submit"}
                </button>
            </div>

            {message && <p className="text-center text-sm text-gray-700">{message}</p>}
        </div>
    );
}
