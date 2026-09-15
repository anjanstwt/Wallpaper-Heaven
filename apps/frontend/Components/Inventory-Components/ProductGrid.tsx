import Image from "next/image";
import { useState } from "react";
import { Maximize2, X } from "lucide-react";

interface Product {
    id: number;
    name: string;
    image: string;
    color: string;
    mrp: number;
}

export default function ProductGrid({
    products,
    onSelect,
}: {
    products: Product[];
    onSelect: (product: Product) => void;
}) {
    return (
        <div className="min-h-[600px] w-full p-4 sm:p-6 lg:p-10 ">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 place-items-center">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onSelect={() => onSelect(product)}
                    />
                ))}
            </div>
        </div>
    );
}

function ProductCard({
    product,
    onSelect,
}: {
    product: Product;
    onSelect: () => void;
}) {
    const [fullscreen, setFullscreen] = useState(false);

    return (
        <>
            <div
                className="w-full max-w-[350px] h-auto flex flex-col items-center cursor-pointer"
                onClick={onSelect}
            >
                <div className="w-full aspect-square max-w-[350px] max-h-[350px] rounded-xl relative overflow-hidden shadow-xl hover:scale-105 transition-all transform duration-200">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setFullscreen(true);
                        }}
                        className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 hover:scale-105 cursor-pointer transition-all transform duration-200"
                    >
                        <Maximize2 className="size-5" />
                    </button>

                    <div className="absolute bottom-0 left-0 w-full h-[90px] bg-gradient-to-t from-black/80 via-black/60 to-transparent text-neutral-100 flex flex-col justify-center items-center px-3 py-2">
                        <span className="text-xl font-normal tracking-wider">
                            {product.name}
                        </span>
                        <span className="text-md mt-1">
                            Color: {product.color} | MRP: ₹{product.mrp}
                        </span>
                    </div>
                </div>
            </div>

            {fullscreen && (
                <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain"
                    />
                    <button
                        onClick={() => setFullscreen(false)}
                        className="absolute top-6 right-6 bg-black/60 text-white p-2 rounded-full hover:bg-black/80"
                    >
                        <X className="size-6" />
                    </button>
                </div>
            )}
        </>
    );
}
