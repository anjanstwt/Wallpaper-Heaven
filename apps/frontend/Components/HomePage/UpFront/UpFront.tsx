import Image from "next/image";
import homePage from "../../../public/upfrontNew.jpeg";

export default function UpFront() {
    return (
        <div className="relative w-full text-white">
            <Image
                src={homePage}
                alt="Wallpaper heaven"
                className="w-full h-[100vh] object-cover object-center"
                unoptimized
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-10" />

            <div className="absolute top-1/2 left-4 sm:left-[10%] right-4 sm:right-auto -translate-y-1/2 z-20 flex flex-col gap-4 sm:gap-5 max-w-full sm:max-w-xl">

                <div className="text-xs sm:text-sm uppercase tracking-wide bg-white/10 px-3 py-1 rounded-full w-fit font-medium text-[#d1d8be] shadow-md backdrop-blur-md">
                    Curated by Artists
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-md">
                    Wallpaper Heaven
                </h1>

                <p className="text-base sm:text-lg md:text-2xl text-[#e5e5e5] font-medium">
                    Give your home a <span className=" font-semibold text-[#ccc5b5]">heavenly</span> vibe with designer walls.
                </p>

                <button className="mt-3 w-fit px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base bg-gradient-to-br from-[#0b1d51]  to-[#725cad]  text-[#e4e4e4] font-semibold rounded-md cursor-pointer shadow-lg hover:text-white hover:-translate-y-1 hover:shadow-black/30 transition duration-250">
                    Explore Designs
                </button>
            </div>

        </div>
    );
}
