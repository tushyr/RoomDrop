"use client";

import Link, { type LinkProps } from "next/link";
import { useTransitionRouter } from "@/lib/useTransitionRouter";

interface TransitionLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">,
    LinkProps {
  children: React.ReactNode;
}

/**
 * Drop-in replacement for Next.js <Link> that plays the veil transition
 * before navigating. Use this for all internal links that should animate.
 */
export default function TransitionLink({
  href,
  children,
  onClick,
  ...rest
}: TransitionLinkProps) {
  const router = useTransitionRouter();

  return (
    <Link
      href={href}
      onClick={(e) => {
        // Only intercept left-click without modifiers (same-tab navigation)
        if (
          e.button === 0 &&
          !e.metaKey &&
          !e.ctrlKey &&
          !e.shiftKey &&
          !e.altKey
        ) {
          e.preventDefault();
          router.push(href.toString());
          onClick?.(e);
        }
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
