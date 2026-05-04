import type { ReactNode } from "react";
import Navbar from "./Navbar";

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-teal-600 px-4 pb-10 pt-4">
      <Navbar />
      <main className="mx-auto mt-4 w-full max-w-6xl rounded-2xl bg-white px-5 py-8 shadow-md ring-1 ring-black/5">
        {children}
      </main>
    </div>
  );
}
