"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface PrivacyContextType {
  isPrivate: boolean;
  togglePrivacy: () => void;
}

const PrivacyContext = createContext<PrivacyContextType>({
  isPrivate: false,
  togglePrivacy: () => {},
});

export const usePrivacy = () => useContext(PrivacyContext);

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [isPrivate, setIsPrivate] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("vortex-privacy");
    if (saved) {
      setIsPrivate(saved === "true");
    }
    setMounted(true);
  }, []);

  const togglePrivacy = () => {
    setIsPrivate((prev) => {
      const next = !prev;
      localStorage.setItem("vortex-privacy", next.toString());
      return next;
    });
  };

  // Evitar hidratación incorrecta
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <PrivacyContext.Provider value={{ isPrivate, togglePrivacy }}>
      <div className={isPrivate ? "privacy-mode-active" : ""}>
        {children}
      </div>
    </PrivacyContext.Provider>
  );
}
