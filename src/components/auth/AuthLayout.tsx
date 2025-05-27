import { ReactNode } from "react";
import { Link } from "react-router-dom";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#1B1B1B]">
      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full bg-[rgba(250,246,240,0.8)] backdrop-blur-md border-b border-[#E5E5E5]/30">
        <div className="max-w-[980px] mx-auto flex h-12 items-center justify-between px-4">
          <div className="flex items-center">
            <Link to="/" className="font-medium text-xl">
              <img
                src="/images/rtgradey-logo.svg"
                alt="RTGradey Logo"
                className="h-8"
              />
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-7 text-sm font-light">
            <Link to="/" className="hover:text-[#FFB672]">
              Features
            </Link>
            <Link to="/" className="hover:text-[#FFB672]">
              Documentation
            </Link>
            <Link to="/" className="hover:text-[#FFB672]">
              Components
            </Link>
            <Link to="/" className="hover:text-[#FFB672]">
              Examples
            </Link>
            <Link to="/" className="hover:text-[#FFB672]">
              Support
            </Link>
          </nav>
        </div>
      </header>

      <div className="min-h-screen flex items-center justify-center pt-12">
        <div className="max-w-md w-full px-4">{children}</div>
      </div>
    </div>
  );
}
