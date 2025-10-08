import TokenLogo from "@/components/cryptoui/token-logo";
import IndexHero from "@/components/landing/hero";
import LatestTokensScroll from "@/components/landing/latest-tokens";
import useTokensList from "@/hooks/use-tokens-list";
import type { Token } from "@/types";
import { motion } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";

type TokenWithPosition = Token & { x: number; y: number; id: number };

const MAX_DROPPING_TOKENS = 50;
const MIN_DROP_INTERVAL = 800;
const MAX_DROP_INTERVAL = 1200;

const MemoizedTokenLogo = React.memo(TokenLogo);

export default function IndexPage() {
  const { data: initialTokens } = useTokensList();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [droppingTokens, setDroppingTokens] = useState<TokenWithPosition[]>([]);
  const lastDropTime = useRef<number>(performance.now());
  const nextDropInterval = useRef<number>(1000);
  const animationFrameId = useRef<number | null>(null);
  const isVisible = useRef<boolean>(true);

  useEffect(() => {
    if (initialTokens && initialTokens.length > 0) {
      setTokens(initialTokens);
    }
  }, [initialTokens]);

  const addTokenBackToPool = useCallback((token: Token) => {
    setTokens((prev) => [...prev, token]);
  }, []);

  const dropToken = useCallback(
    (currentTime: number) => {
      if (
        isVisible.current &&
        tokens.length > 0 &&
        droppingTokens.length < MAX_DROPPING_TOKENS &&
        currentTime - lastDropTime.current > nextDropInterval.current
      ) {
        const randomIndex = Math.floor(Math.random() * tokens.length);
        const randomToken = tokens[randomIndex];
        const newToken = {
          ...randomToken,
          id: Math.random(),
          x:
            window.innerWidth / 2 +
            (Math.random() * (window.innerWidth / 2) - window.innerWidth / 3),
          y: -50,
        };

        setDroppingTokens((prev) => [...prev, newToken]);
        setTokens((prev) => prev.filter((_, index) => index !== randomIndex));

        lastDropTime.current = currentTime;
        nextDropInterval.current =
          Math.random() * (MAX_DROP_INTERVAL - MIN_DROP_INTERVAL) +
          MIN_DROP_INTERVAL;
      }
      animationFrameId.current = requestAnimationFrame(dropToken);
    },
    [tokens, droppingTokens.length],
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisible.current = !document.hidden;
      if (isVisible.current) {
        lastDropTime.current = performance.now();
        if (!animationFrameId.current) {
          animationFrameId.current = requestAnimationFrame(dropToken);
        }
      } else {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    animationFrameId.current = requestAnimationFrame(dropToken);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [dropToken]);

  const handleTokenLand = useCallback(
    (token: Token) => {
      setDroppingTokens((prev) =>
        prev.filter((t) => t.TokenProcess !== token.TokenProcess),
      );
      addTokenBackToPool(token);
    },
    [addTokenBackToPool],
  );

  const boxPosition = document.getElementById("tokensBox")?.offsetTop ?? 0;

  return (
    <div className="w-full min-h-screen pb-32 container relative">
      <div className="relative z-20">
        <LatestTokensScroll />
        <IndexHero />
      </div>
      {droppingTokens.map((token) => (
        <motion.div
          key={token.id} // Changed from TokenProcess to id
          className="top-0 z-10 absolute"
          initial={{ x: token.x, y: token.y }}
          animate={{
            y: boxPosition + 150,
          }}
          transition={{ duration: 5, ease: "linear" }}
          onAnimationComplete={() => handleTokenLand(token)}
        >
          <MemoizedTokenLogo token={token} />
        </motion.div>
      ))}
      <motion.div
        className="container h-48 relative"
        id="tokensBox"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 2,
          ease: "linear",
        }}
      >
        <motion.div className="w-full relative">
          <div className="bg-[#C5C3D1] h-[1px] absolute left-0 top-0 z-0 w-full" />
          <img
            src="box.svg"
            alt="box"
            className="object-fill relative z-20 -mt-[1px]"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
