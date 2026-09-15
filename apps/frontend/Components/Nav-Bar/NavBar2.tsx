"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ArrowRightFromLine, User } from 'lucide-react';
import SignIn from '../Auth/Signin';
import { signOut, useSession } from 'next-auth/react';
import { IconCaretDownFilled, IconSearch, IconSquarePlus } from '@tabler/icons-react';
import OfferPanel from '../SetOfferPanel/OfferPanel';

export default function Navbar2() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [signinOption, setSigninOption] = useState(false);
  const [signin, setSignin] = useState(false);
  const [logoutPanel, setLogoutPanel] = useState(false);
  const [adminPanel, setAdminPanel] = useState(false);
  const [searchPanel, setSearchPanel] = useState(false);
  const [offerPanel, setOfferPanel] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const adminPanelRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);

    // entrance animation
    gsap.from('.nav-item', {
      y: -20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: 'power3.out',
    });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (signinOption && dropdownRef.current) {
      gsap.fromTo(dropdownRef.current, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 });
    }
  }, [signinOption]);

  useEffect(() => {
    if (adminPanel && adminPanelRef.current) {
      gsap.fromTo(adminPanelRef.current, { opacity: 0, y: -5 }, { opacity: 1, y: 0, duration: 0.25 });
    }
  }, [adminPanel]);

  return (
    <>
      <nav
        className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out rounded-2xl text-black
        ${isScrolled
            ? "top-2 max-w-5xl bg-white text-black shadow-md py-2"
            : "top-1 w-full bg-transparent text-black py-4 border-none"}`}
        style={{
          width: "100%",
          transition: "max-width 0.6s ease, top 0.4s ease",
        }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <span className={`text-lg sm:text-xl lg:text-2xl font-semibold font-playfair ${isScrolled ? 'text-black' : ''}`}>
              Wallpaper Heaven
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {['collections', 'inspiration', 'about', 'contact'].map((href, idx) => (
              <Link key={href} href={href} className={`nav-item transition-colors duration-300 ${isScrolled ? 'text-neutral-800 hover:text-gray-600' : 'text-black hover:text-neutral-700'}`}>
                {['Collections', 'Genre', 'Brands', 'Designers'][idx]}
              </Link>
            ))}

            <div className="relative">
              <button onClick={() => { setSearchPanel(prev => !prev); setSigninOption(false); }}>
                <IconSearch className="w-6 h-6 mt-1 hover:text-gray-300 transition-colors duration-200 cursor-pointer" />
              </button>
              {searchPanel && (
                <input
                  type="text"
                  placeholder="Search"
                  className="absolute top-12 right-0 w-[300px] h-[35px] px-4 text-sm text-gray-700 bg-white rounded-full shadow-md outline-none z-40"
                />
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setSigninOption(prev => !prev);
                  setSearchPanel(false);
                }}
                className={`nav-item px-4 py-1 rounded-full transition-colors duration-300 cursor-pointer ${isScrolled ? 'text-black hover:text-[9e9e9e]' : 'text-black hover:text-neutral-700'}`}
              >
                <User />
              </button>

              {signinOption && (
                <div
                  ref={dropdownRef}
                  className="absolute top-12 right-0 bg-white text-black shadow-lg rounded-md border border-neutral-300 z-30"
                >
                  {session ? (
                    <div className="p-4 space-y-3 min-w-[240px]">
                      <div className="text-sm font-semibold text-gray-800">Hello, {session.user?.email || "User"}</div>
                      <div className="flex gap-3">
                        <div
                          onClick={() => setAdminPanel(prev => !prev)}
                          className="px-4 py-2 flex items-center gap-2 rounded-md bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 shadow-sm cursor-pointer"
                        >
                          <span>Admin</span>
                          <IconCaretDownFilled />
                        </div>
                        <div
                          onClick={() => setLogoutPanel(true)}
                          className="flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 shadow-sm cursor-pointer"
                        >
                          <ArrowRightFromLine className="w-4 h-4" />
                          Logout
                        </div>
                      </div>
                      {adminPanel && (
                        <div ref={adminPanelRef} className="mt-2 flex flex-col space-y-2">
                          {["Tag", "Product", "Brand", "Offer"].map((item, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                console.log(`${item} clicked`, session);
                                if (item == "Offer") {
                                  setOfferPanel(true);
                                }
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                            >
                              <IconSquarePlus className="w-4 h-4" />
                              {item}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setSignin(true);
                        setSigninOption(false);
                      }}
                      className="p-3 w-[160px] text-center hover:text-black cursor-pointer"
                    >
                      <div className="text-base font-medium">Sign In</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Nav */}
          <div className="flex items-center md:hidden space-x-4">
            <button onClick={() => setSearchPanel(prev => !prev)}>
              <IconSearch className="w-5 h-5" />
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" stroke="currentColor" fill="none">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {searchPanel && (
          <div className="md:hidden px-4 sm:px-6 mt-2">
            <input
              type="text"
              placeholder="Search"
              className="w-full h-[35px] px-4 text-sm text-gray-700 bg-white rounded-full shadow-md outline-none z-40"
            />
          </div>
        )}

        {isMenuOpen && (
          <div className="md:hidden bg-white mt-2 py-4">
            <div className="container mx-auto px-4 sm:px-6 flex flex-col gap-4">
              {['#collections', '#inspiration', '#about', '#contact'].map((href, idx) => (
                <Link key={href} href={href} className="text-gray-800 hover:text-gray-600">
                  {['Collections', 'Inspiration', 'About Us', 'Contact'][idx]}
                </Link>
              ))}
              <button onClick={() => setSignin(true)} className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800">
                Sign In
              </button>
            </div>
          </div>
        )}
      </nav>

      {logoutPanel && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center">
          <div className="bg-[#181818] text-white p-6 rounded-lg shadow-xl text-center space-y-4 w-[80%] max-w-[340px]">
            <p className="text-xl pb-0.5 font-normal">Are you sure {session?.user?.email}?</p>
            <div className="flex justify-center space-x-5">
              <button onClick={() => { setLogoutPanel(false); signOut({ callbackUrl: "/" }); }} className="px-4 py-2 bg-red-700 hover:bg-red-800 cursor-pointer text-white rounded-md">
                Logout
              </button>
              <button onClick={() => setLogoutPanel(false)} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded-md cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {offerPanel && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center">
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
            <button
              onClick={() => setOfferPanel(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ✕
            </button>
            {session?.user?.id && (
              <OfferPanel adminId={session.user.id} />
            )}
          </div>
        </div>
      )}

      {signin && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center">
          <div className="relative z-50">
            <SignIn handleClick={() => setSignin(false)} />
          </div>
        </div>
      )}
    </>
  );
}
