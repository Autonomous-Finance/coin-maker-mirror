"use client";

import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  AnimatePresence,
  cubicBezier,
  motion,
  useAnimation,
  useInView,
} from "framer-motion";
import { useEffect, useRef } from "react";
import { buttonVariants } from "../ui/button";

const cardImage = [
  {
    id: 1,
    title: "Tom",
    link: "#",
    image: "https://avatar.vercel.sh/tom",
  },
  {
    id: 2,
    title: "Chris",
    link: "#",
    image: "https://avatar.vercel.sh/chris",
  },
  {
    id: 3,
    title: "PJ",
    link: "#",
    image: "https://avatar.vercel.sh/pj",
  },
  {
    id: 4,
    title: "Scott",
    link: "#",
    image: "https://avatar.vercel.sh/scott",
  },
  {
    id: 5,
    title: "Yehuda",
    link: "#",
    image: "https://avatar.vercel.sh/yehuda",
  },
  {
    id: 6,
    title: "Ezra",
    link: "#",
    image: "https://avatar.vercel.sh/ezra",
  },
  {
    id: 7,
    title: "Ivey",
    link: "#",
    image: "https://avatar.vercel.sh/ivey",
  },
  {
    id: 8,
    title: "Evan",
    link: "#",
    image: "https://avatar.vercel.sh/evan",
  },
  {
    id: 9,
    title: "Van",
    link: "#",
    image: "https://avatar.vercel.sh/van",
  },
  {
    id: 7,
    title: "Ivey",
    link: "#",
    image: "https://avatar.vercel.sh/ivey",
  },
  {
    id: 8,
    title: "Evan",
    link: "#",
    image: "https://avatar.vercel.sh/evan",
  },
  {
    id: 7,
    title: "Ivey",
    link: "#",
    image: "https://avatar.vercel.sh/ivey",
  },
  {
    id: 8,
    title: "Evan",
    link: "#",
    image: "https://avatar.vercel.sh/evan",
  },
  {
    id: 9,
    title: "Van",
    link: "#",
    image: "https://avatar.vercel.sh/van",
  },
  {
    id: 9,
    title: "Van",
    link: "#",
    image: "https://avatar.vercel.sh/van",
  },
  {
    id: 7,
    title: "Ivey",
    link: "#",
    image: "https://avatar.vercel.sh/ivey",
  },
  {
    id: 8,
    title: "Evan",
    link: "#",
    image: "https://avatar.vercel.sh/evan",
  },
  {
    id: 9,
    title: "Van",
    link: "#",
    image: "https://avatar.vercel.sh/van",
  },
];

export default function TokensShowcase() {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { amount: 0.25 });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [inView, controls]);

  return (
    <div className="flex h-full transform-gpu flex-col items-center justify-between gap-5 rounded-lg bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] dark:bg-transparent dark:backdrop-blur-md  dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] xl:flex-row">
      <div className="flex w-full max-w-3xl flex-col items-start justify-between gap-y-10 p-10 xl:h-full xl:w-1/2">
        <h2 className="text-3xl font-semibold">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        </h2>
        <Link
          to="/tokens"
          className={cn(buttonVariants({ variant: "link" }), "text-white px-0")}
        >
          Check out latest tokens
        </Link>
      </div>
      <div className="relative w-full overflow-hidden xl:w-1/2">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1/3 bg-gradient-to-b from-white dark:from-black" />
        <div
          ref={containerRef}
          className="relative -right-[50px] -top-[100px] grid max-h-[450px] grid-cols-3 gap-5 [transform:rotate(-15deg)translateZ(10px);]"
        >
          <AnimatePresence>
            {cardImage.map((card, index) => (
              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.96, y: 25 },
                  visible: { opacity: 1, scale: 1, y: 0 },
                }}
                initial="hidden"
                animate={controls}
                exit={{
                  opacity: 0,
                  scale: 0,
                  transition: {
                    duration: 0.1,
                    ease: cubicBezier(0.22, 1, 0.36, 1),
                  },
                }}
                transition={{
                  duration: 0.2,
                  ease: cubicBezier(0.22, 1, 0.36, 1),
                  delay: index * 0.04,
                }}
                key={card.id}
                className="flex items-center gap-y-2 gap-4 rounded-md border bg-white/5 p-5"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-12 w-12 rounded-full object-cover"
                />

                <div className="flex flex-col">
                  <figcaption className="text-sm text-muted-foreground font-light">
                    test token
                  </figcaption>
                  <p className="text-lg font-medium dark:text-white">THO</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
