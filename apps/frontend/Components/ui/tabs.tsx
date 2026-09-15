"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Tab = {
  title: string;
  value: string;
  content?: React.ReactNode;
};

export const Tabs = ({
  tabs,
  containerClassName,
  tabButtonClassName,
  activeTabClassName,
  contentClassName,
}: {
  tabs: Tab[];
  containerClassName?: string;
  tabButtonClassName?: string;
  activeTabClassName?: string;
  contentClassName?: string;
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0].value);

  const active = tabs.find((t) => t.value === activeTab)!;

  return (
    <div
      className={cn(
        "h-[400px] flex flex-col justify-center items-center md:flex-row gap-16 w-full max-w-5xl mx-auto",
        containerClassName
      )}
    >
      {/* Tag content on left */}
      {/* here should be the tab contents */}

      {/* Tabs buttons on right */}
      <div className="w-full grid grid-cols-3 gap-3 ">
        {[...tabs, ...Array(12 - tabs.length).fill(null)].map((tab, index) => (
          tab ? (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "h-20 relative px-3 py-0.5 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-[16px] flex justify-center items-center text-center text-gray-800 font-medium border border-green-300 backdrop-blur-lg bg-white/40 dark:bg-white/10 transition-all",
                tabButtonClassName,
                activeTab === tab.value &&
                cn(
                  "bg-green-100/60 border-green-500 shadow-md",
                  activeTabClassName
                )
              )}
            >
              {tab.title}
            </button>
          ) : (
            <div key={`placeholder-${index}`} className="h-16" />
          )
        ))}
      </div>



    </div>
  );
};


export const FadeInDiv = ({
  className,
  tabs,
  active,
  hovering,
}: {
  className?: string;
  key?: string;
  tabs: Tab[];
  active: Tab;
  hovering?: boolean;
}) => {
  const isActive = (tab: Tab) => tab.value === tabs[0].value;

  return (
    <div className={cn("relative", className)}>
      {tabs.map((tab, idx) => (
        <motion.div
          key={tab.value}
          layoutId={tab.value}
          style={{
            scale: 1 - idx * 0.1,
            top: hovering ? idx * -50 : 0,
            zIndex: -idx,
            opacity: idx < 3 ? 1 - idx * 0.1 : 0,
          }}
          animate={{
            y: isActive(tab) ? [0, 40, 0] : 0,
          }}
          className="absolute top-0 left-0 w-full h-full"
        >
          {tab.content}
        </motion.div>
      ))}
    </div>
  );
};
