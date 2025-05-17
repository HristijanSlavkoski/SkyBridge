import { useState } from "react";
import { Link } from "wouter";
import Logo from "@/components/ui/logo";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt="SkyBridge Logo" className="mr-3 w-30 h-20" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">SkyBridge</h1>
            <p className="text-xs text-gray-600">Satellite Medical Assistance</p>
          </div>
        </Link>
        
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <li><Link href="/" className="text-gray-700 hover:text-primary-600 font-medium">Home</Link></li>
            <li><Link href="/about" className="text-gray-700 hover:text-primary-600 font-medium">About</Link></li>
            <li><Link href="/contact" className="text-gray-700 hover:text-primary-600 font-medium">Contact</Link></li>
          </ul>
        </nav>
        
        <button 
          className="md:hidden text-gray-700" 
          onClick={toggleMenu}
          aria-label="Toggle mobile menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="px-4 py-3 bg-gray-50 md:hidden">
          <ul className="space-y-2">
            <li><Link href="/" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">Home</Link></li>
            <li><Link href="/about" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">About</Link></li>
            <li><Link href="/contact" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">Contact</Link></li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
