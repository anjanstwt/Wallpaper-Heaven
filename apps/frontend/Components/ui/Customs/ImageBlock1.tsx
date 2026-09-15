import Image from "next/image";

interface ImageBlock1Props {
    NoLrounded?: boolean,
    NoRrounded?: boolean,
    content: React.ReactNode,
    widthRatio: number,
    glassmorphism?: boolean
}

export default function ImageBlock1({ NoLrounded, NoRrounded, content, widthRatio, glassmorphism }: ImageBlock1Props) {

    return <div className={`h-70 bg-[#E6E0C5] p-2 max-w-full  ${NoLrounded ? "pl-0 rounded-r-xl": "rounded-l-xl"} ${NoRrounded ? "pr-0 rounded-l-xl" : "rounded-r-xl"} `}
        style={{
            width: `${widthRatio * 460}px`,
            maxWidth: "100%"
        }}
    >
        <div className={`h-full rounded-xl ${NoLrounded ? "rounded-l-none": ""} ${NoRrounded ? "rounded-r-none" : ""} overflow-hidden ${glassmorphism ? "backdrop-blur-2xl flex justify-center items-center pl-5 bg-white/50 border-2 border-l-0 border-white" : ""}`} >
                {content}
        </div>
    </div>
}