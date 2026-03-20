import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, Shield, Menu, X, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/results", label: "Election Results" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top authoritative bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6 lg:px-8 text-center sm:text-left flex justify-between items-center">
        <span>Government of India • Election Commission Portal</span>
        <div className="hidden sm:flex space-x-4">
          <span>Toll Free: 1950</span>
          <span>Help Desk</span>
        </div>
      </div>

      <header className="sticky top-0 z-50 glass-panel border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-3 group">
              <img 
                src={`${import.meta.env.BASE_URL}images/logo.png`} 
                alt="Election Portal Logo" 
                className="w-12 h-12 object-contain drop-shadow-md group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>';
                }}
              />
              <div>
                <h1 className="text-xl font-display font-bold text-slate-900 leading-tight">
                  E-Voting <span className="text-primary">India</span>
                </h1>
                <p className="text-xs font-medium tracking-wider text-slate-500 uppercase">
                  Secure. Transparent. Democratic.
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={cn(
                    "text-sm font-semibold transition-colors hover:text-primary relative py-2",
                    location === link.href ? "text-primary" : "text-slate-600"
                  )}
                >
                  {link.label}
                  {location === link.href && (
                    <motion.div 
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </Link>
              ))}
              
              {isAdmin && (
                <Link 
                  href="/admin"
                  className={cn(
                    "text-sm font-semibold flex items-center transition-colors hover:text-accent",
                    location.startsWith('/admin') ? "text-accent" : "text-slate-600"
                  )}
                >
                  <Shield className="w-4 h-4 mr-1.5" />
                  Admin Panel
                </Link>
              )}
            </nav>

            {/* User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link href="/profile" className="flex items-center space-x-2 text-sm font-medium text-slate-700 hover:text-primary transition-colors bg-slate-100 py-1.5 px-3 rounded-full hover:bg-slate-200">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white shadow-inner">
                      <User className="w-4 h-4" />
                    </div>
                    <span>{user?.name.split(' ')[0]}</span>
                  </Link>
                  <button 
                    onClick={() => logout()}
                    className="text-slate-500 hover:text-destructive transition-colors p-2 rounded-full hover:bg-red-50"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link 
                    href="/login"
                    className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors px-4 py-2"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register"
                    className="text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-all shadow-md hover:shadow-lg shadow-primary/20 px-6 py-2.5 rounded-full flex items-center"
                  >
                    Register to Vote
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-border bg-white"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link 
                  href="/admin"
                  className="block px-3 py-2 rounded-md text-base font-medium text-accent hover:bg-slate-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              
              <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col space-y-3">
                {isAuthenticated ? (
                  <>
                    <Link 
                      href="/profile" 
                      className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <button 
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-destructive hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login"
                      className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      href="/register"
                      className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-white text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Register to Vote
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative">
        {children}
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <div className="flex justify-center items-center space-x-4 mb-6">
            <div className="w-16 h-1 bg-primary rounded-full"></div>
            <div className="w-16 h-1 bg-white rounded-full"></div>
            <div className="w-16 h-1 bg-secondary rounded-full"></div>
          </div>
          <p className="font-display text-lg text-white font-semibold mb-2">India Election Voting Portal</p>
          <p className="text-sm max-w-xl mx-auto leading-relaxed">
            Empowering citizens through secure, transparent, and accessible digital voting infrastructure. 
            Exercise your right to vote and shape the future of the nation.
          </p>
          <div className="mt-8 pt-8 border-t border-slate-800 text-xs">
            &copy; {new Date().getFullYear()} Election Commission Demonstration. For illustrative purposes only.
          </div>
        </div>
      </footer>
    </div>
  );
}
