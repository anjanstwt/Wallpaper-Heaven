import Link from "next/link";
import { TabSwitcher } from "../../Slider/TabSwitcher";
import { IconCaretRightFilled } from "@tabler/icons-react";


export default function Genre() {
    return <div className="h-auto pb-16 sm:pb-30 w-full flex flex-col items-start">
        <div className="px-4 sm:px-10 w-full">
            <div className="text-lg md:text-3xl text-[#0B2814] font-bold ">
                <Link href={`/inventory/genre`} className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                    <>
                        <div className="text-2xl sm:text-3xl border-b-2 border-b-green-500">
                            GENRE
                        </div>
                        {/* <IconCaretRightFilled className="size-4 md:size-5 ml-2" /> */}
                    </>
                    <div className="flex">
                        {/* <span className="text-[25px] tracking-widest font-light text-green-400 px-4 py-1 md:text-md">
                        -----------------------------------------------------------------
                        </span> */}
                        <div className="text-sm sm:text-base md:text-[24px] tracking-wider font-light bg-green-500 px-3 py-1 sm:px-4 md:text-md text-[#000000]  ">
                            CHOOSE THE LOOK THAT MATCHES YOUR VIBE
                        </div>
                    </div>
                </Link>

            </div>

        </div>
        <div className="mt-8 sm:mt-[50px] px-4 sm:px-10 w-full">
            <TabSwitcher />
        </div>
    </div>
}