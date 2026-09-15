import Image from "next/image";
import homeImage from "../../public/home.jpeg";
import ImageBlock1 from "../ui/Customs/ImageBlock1";

export default function BrickGrid() {
    return <div className="w-full bg-[#0B2814] py-[2px] ">
        <div className="flex flex-wrap sm:flex-nowrap gap-[2px] mb-[2px] ">
            {[1, 2, 3, 4].map((key) => (
                key === 1 ?
                <ImageBlock1 NoLrounded content={<Image src={homeImage} alt="Home" className="h-full " />} widthRatio={1/3} key={key} />
                : key === 4 ?
                <ImageBlock1 NoRrounded content={<Image src={homeImage} alt="Home" className="h-full " />} widthRatio={2/3} key={key} />
                :
                <ImageBlock1 content={<Image src={homeImage} alt="Home" className="h-full " />} widthRatio={1} key={key} />
            ))}
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-[2px] mb-[2px] ">
            {[1, 2, 3, 4].map((key) => (
                key === 1 ?
                <ImageBlock1 NoLrounded content={<div>
                    <div className="text-2xl font-semibold">Designs</div>
                        <div className="text-xs">Aesthetics that matches your</div>
                        <div className="text-red-950 text-xs">vibe</div>
                </div>} widthRatio={2/3} glassmorphism  key={key} />
                : key === 4 ?
                <ImageBlock1 NoRrounded content={<Image src={homeImage} alt="Home" className="h-full " />} widthRatio={1/3} />
                :
                <ImageBlock1 content={<Image src={homeImage} alt="Home" className="h-full " />} widthRatio={1} />
            ))}
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-[2px] ">
            {[1, 2, 3, 4].map((key) => (
                key === 1 ?
                <ImageBlock1 NoLrounded content={<Image src={homeImage} alt="Home" className="h-full " />} widthRatio={1/3} />
                : key === 4 ?
                <ImageBlock1 NoRrounded content={<Image src={homeImage} alt="Home" className="h-full " />} widthRatio={2/3} />
                :
                <ImageBlock1 content={<Image src={homeImage} alt="Home" className="h-full " />} widthRatio={1} />
            ))}
        </div>
    </div>
}