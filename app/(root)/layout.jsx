import React from "react";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
// import { dark } from "@clerk/themes";

import "../globals.css";
import Footer from "@/components/Footer";
import LeftSide from "@/components/LeftSide";
import RightSide from "@/components/RightSide";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SciSphere",
  description: "A Next.js 13 Meta scientific blog application",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
    // appearance={{
    //   baseTheme: dark,
    // }}
    >
      <html lang="en">
        <body className={inter.className}>
          <Navbar />

          <main className="flex flex-row">
            <LeftSide />
            <section className="main-container">
              <div className="w-full max-w-4xl">{children}</div>
            </section>
            {/* @ts-ignore */}
            <RightSide />
          </main>

          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
