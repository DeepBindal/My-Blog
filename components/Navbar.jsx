import { OrganizationSwitcher, SignOutButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { dark } from "@clerk/themes";
import { Button } from "./ui/button";

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link href="/" className="flex items-center gap-4">
        <Image src="/logo.svg" alt="logo" width={28} height={28} />
        <p className="text-heading3-bold text-light-1 max-xs:hidden">
          SciSphere
        </p>
      </Link>

      <div className="flex items-center gap-1">
        <SignedOut>
          <Button asChild className="bg-zinc-800">
            <Link href="/sign-in">Login</Link>
          </Button>
        </SignedOut>
        <div className="block md:hidden">
          <SignedIn>
            <SignOutButton>
              <div className="flex cursor-pointer">
                <Image
                  src="./assets/logout.svg"
                  alt="logout"
                  height={24}
                  width={24}
                />
              </div>
            </SignOutButton>
          </SignedIn>
        </div>
        <OrganizationSwitcher
          appearance={{
            // baseTheme: dark,
            elements: {
              organizationSwitcherTrigger: "py-2 text-white hover:text-gray-300 py-4",
            },
          }}
        />
      </div>
    </nav>
  );
};

export default Navbar;
