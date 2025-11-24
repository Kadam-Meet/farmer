import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tractor } from "lucide-react";

export const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Tractor className="h-6 w-6" />
            FarmShare
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/browse" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/browse") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Browse Listings
            </Link>
            <Link 
              to="/add-listing" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/add-listing") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Add Listing
            </Link>
            <Link 
              to="/bookings" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/bookings") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Bookings
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hidden md:inline-flex">
              Sign In
            </Button>
            <Button size="sm">Get Started</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
