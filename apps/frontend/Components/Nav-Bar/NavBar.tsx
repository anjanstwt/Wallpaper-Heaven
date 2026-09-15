"use client";
import { Navbar, NavBody, NavItems, NavbarLogo, NavbarButton } from "@/Components/ui/resizable-navbar";
import Image from "next/image";
import BrandName from "../ui/Customs/BrandName";
import homePage from "../../public/home.jpeg"
import BrickGrid from "../Grids/BrickGrid";

export default function NavBar() {
    return (
        <div className="h-full w-full">
            <Navbar className="top-20 ">
                <NavBody>
                    {/* <NavbarLogo  /> */}
                    <BrandName size={"sm"} />
                    <NavItems
                        items={[
                            { name: "Home", link: "/" },
                            { name: "About", link: "/about" },
                            { name: "Contact", link: "/contact" },
                        ]}
                    />
                    <div className="flex items-center gap-4">
                        <NavbarButton href="/login" variant="secondary" >Login</NavbarButton>
                        <NavbarButton href="/login" variant="primary" >Book a call</NavbarButton>
                    </div>
                </NavBody>
            </Navbar>

            <main className=" flex flex-col items-center justify-center h-[calc(100vh-6rem)]">
                <div className="h-full w-full flex justify-center items-center mt-14 ">
                    <Image src={homePage} alt="home page" className="w-full rounded-lg" />
                </div>
                <BrickGrid />
            </main>
        </div>
    );
}
