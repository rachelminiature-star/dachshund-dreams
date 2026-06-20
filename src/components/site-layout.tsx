import type { ReactNode } from "react";
import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";
import { BackToTop } from "./floating-buttons";

export function SiteLayout({
  children,
  transparentNav = false,
}: {
  children: ReactNode;
  transparentNav?: boolean;
}) {
  return (
    <>
      <SiteNav transparentOnTop={transparentNav} />
      <main id="main" className="min-h-dvh">
        {children}
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  );
}
