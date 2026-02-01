"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/exclusive", label: "Exclusive Content" },
  { href: "/admin", label: "Admin" }
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="navbar" aria-label="Main navigation">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          className={clsx("nav-link", {
            "button pink": pathname === link.href
          })}
          href={link.href}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
