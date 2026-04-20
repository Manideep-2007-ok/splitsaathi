import { useState, useEffect } from "react";

const MOBILE_USER_AGENT_PATTERN = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i;

export function useDevice() {
  const [isMobile, setIsMobile] = useState(() =>
    MOBILE_USER_AGENT_PATTERN.test(navigator?.userAgent ?? "")
  );

  const [screenWidth, setScreenWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      setIsMobile(
        MOBILE_USER_AGENT_PATTERN.test(navigator?.userAgent ?? "") ||
        window.innerWidth < 768
      );
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isDesktop = screenWidth >= 1024;
  const isMobileScreen = screenWidth < 768;

  return {
    isMobile,
    isTablet,
    isDesktop,
    isMobileScreen,
    screenWidth,
  };
}
