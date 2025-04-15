
import React from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-luxury-black text-luxury-white antialiased">
      <main className="flex-1 px-4 pb-16 pt-6 sm:px-6">
        <div className="mx-auto max-w-md">{children}</div>
      </main>
      <Navbar />
    </div>
  );
};

export default Layout;
