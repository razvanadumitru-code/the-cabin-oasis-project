import React, { useState, useEffect } from 'react';
// No motion import needed
import { Link } from 'react-router-dom';
import cabinLogo from '../images/cabin_logo.png';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/home' },
    { name: 'Rooms', path: '/rooms' },
    { name: 'About', path: '/about' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-pine_teal-500/95 backdrop-blur-md shadow-lg py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-3"
              onClick={() => {
                scrollToTop();
                setIsMobileOpen(false);
              }}
            >
              <img 
                src={cabinLogo} 
                alt="Cabin Oasis Logo" 
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 border-dry_sage-300 shadow-md"
              />
              <span className={`text-xl sm:text-2xl font-bold ${
                scrolled 
                  ? 'bg-gradient-to-r from-dry_sage-500 to-fern-500 bg-clip-text text-transparent' 
                  : 'text-pine_teal-800'
              }`}>
                The Cabin Oasis
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navItems.map((item) => (
                <div key={item.name} className="relative group">
                  <Link
                    to={item.path}
                    onClick={scrollToTop}
                    className={`relative px-3 py-2 text-sm font-medium ${
                      scrolled ? 'text-dust_grey-700' : 'text-pine_teal-800'
                    } hover:text-fern-600 transition-colors duration-200 group block`}
                  >
                    <span className="relative z-10">{item.name}</span>
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-dry_sage-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </Link>
                </div>
              ))}
              <div className="transition-transform hover:scale-105 active:scale-95">
                <Link
                  to="/rooms"
                  onClick={scrollToTop}
                  className="px-4 py-2 rounded-full bg-fern-400 text-pine_teal-900 text-sm font-medium hover:bg-fern-500 transition-colors duration-200 flex items-center space-x-1"
                >
                  <span>Book Now</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              className="text-pine_teal-900 hover:text-fern-500 focus:outline-none"
              onClick={() => setIsMobileOpen((open) => !open)}
              aria-label="Toggle navigation menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile dropdown menu */}
        {isMobileOpen && (
          <div className="md:hidden pt-3 pb-4 space-y-1 border-t border-dry_sage-300/40 bg-pine_teal-600/95 text-dry_sage-50 shadow-lg">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => {
                  scrollToTop();
                  setIsMobileOpen(false);
                }}
                className="block px-3 py-2 rounded-md text-base font-medium text-dry_sage-50 hover:bg-pine_teal-700/80 hover:text-fern-300"
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/rooms"
              onClick={() => {
                scrollToTop();
                setIsMobileOpen(false);
              }}
              className="mt-2 block px-3 py-2 rounded-md bg-fern-400 text-pine_teal-900 text-base font-medium text-center hover:bg-fern-500"
            >
              Book Now
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
