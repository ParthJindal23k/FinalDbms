import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Package, 
  TrendingUp, 
  User, 
  LogOut,
  LogIn,
  Briefcase
} from 'lucide-react';
import { Button } from './ui/button';
import { post } from '../lib/api';

interface NavigationProps {
  isAuthenticated?: boolean;
  userType?: 'user' | 'company' | null;
}

const Navigation: React.FC<NavigationProps> = ({ isAuthenticated = false, userType = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };
  
  const handleLogout = async () => {
    try {
      // Call the logout API endpoint
      await post('/auth/logout', {});
      
      // Clear authentication data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      
      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: Clear localStorage and redirect anyway
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      navigate('/');
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="trade-container">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Package className="h-8 w-8 text-trade-blue" />
              <span className="ml-2 text-xl font-bold text-trade-navy">ImportExport</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-trade-blue flex items-center px-3 py-2">
              <Home className="h-4 w-4 mr-1" />
              <span>Home</span>
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to={userType === 'user' ? '/user-dashboard' : '/company-dashboard'} 
                  className="text-gray-700 hover:text-trade-blue flex items-center px-3 py-2"
                >
                  {userType === 'user' ? 
                    <User className="h-4 w-4 mr-1" /> : 
                    <Briefcase className="h-4 w-4 mr-1" />
                  }
                  <span>Dashboard</span>
                </Link>
                
                <Button 
                  variant="ghost" 
                  className="text-gray-700 hover:text-red-600 flex items-center"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth" className="text-trade-navy font-medium hover:text-trade-blue flex items-center px-3 py-2">
                  <LogIn className="h-4 w-4 mr-1" />
                  <span>Login</span>
                </Link>
                <Link to="/auth?register=true" className="flex items-center">
                  <Button className="bg-trade-blue hover:bg-blue-700">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleNavbar}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-trade-blue focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="text-gray-700 hover:text-trade-blue block px-3 py-2 rounded-md text-base font-medium">
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to={userType === 'user' ? '/user-dashboard' : '/company-dashboard'} 
                  className="text-gray-700 hover:text-trade-blue block px-3 py-2 rounded-md text-base font-medium"
                >
                  Dashboard
                </Link>
                
                <button 
                  className="text-gray-700 hover:text-red-600 w-full text-left block px-3 py-2 rounded-md text-base font-medium"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" className="text-trade-navy font-medium hover:text-trade-blue block px-3 py-2 rounded-md text-base font-medium">
                  Login
                </Link>
                <Link to="/auth?register=true" className="text-gray-700 hover:text-trade-blue block px-3 py-2 rounded-md text-base font-medium">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
