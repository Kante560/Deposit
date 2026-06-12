/**
 * /create layout
 *
 * Wraps the create campaign page with WalletGuard, which:
 *  - Shows a connect modal overlay if the user is not connected
 *  - Shows a switch-network overlay if the user is on the wrong chain
 *  - Renders the page normally when connected on the correct network
 *
 * Using a route-segment layout (instead of wrapping inside page.tsx directly)
 * keeps the page component clean and lets Next.js handle the guard
 * consistently even if additional /create/* sub-routes are added later.
 */

import WalletGuard from "@/components/WalletGuard";

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WalletGuard>{children}</WalletGuard>;
}
