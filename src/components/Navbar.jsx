'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Track scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    // Set initial state
    setIsScrolled(true);
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold mr-3 shadow-md transform group-hover:rotate-12 transition-all duration-300">
                AW
              </div>
              <span className="font-bold text-xl tracking-tight text-blue-600">
                Accent Wall Designer
              </span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex space-x-1">
            {[
              { name: 'Home', href: '/' },
              { name: 'Design Gallery', href: '/gallery' },
              { name: 'Patterns', href: '/patterns' },
              { name: 'Tutorials', href: '/tutorials' },
              { name: 'Pricing', href: '/pricing' }
            ].map((item) => (
              <Link 
                key={item.name}
                href={item.href} 
                className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                  isScrolled 
                    ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/start"
              className="ml-3 px-5 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-md"
            >
              Get Started
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              type="button" 
              className={`${isScrolled ? 'text-gray-700' : 'text-gray-700'} focus:outline-none`}
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div 
        className={`md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="container mx-auto px-4 py-3 space-y-1">
          {[
            { name: 'Home', href: '/' },
            { name: 'Design Gallery', href: '/gallery' },
            { name: 'Patterns', href: '/patterns' },
            { name: 'Tutorials', href: '/tutorials' },
            { name: 'Pricing', href: '/pricing' }
          ].map((item) => (
            <Link 
              key={item.name}
              href={item.href} 
              className="block text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/start"
            className="block mt-2 px-3 py-2 rounded-md bg-blue-600 text-white text-center font-medium hover:bg-blue-700 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
} 