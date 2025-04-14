
import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-trade-navy text-white">
      <div className="trade-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <Package className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold">ImportExport</span>
            </div>
            <p className="text-gray-300 mb-4">
              Streamlining global trade with powerful import and export management solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11C2.7 15.4 3 12 3 12s2.5 2.5 5 3c-2.5-1.7-2.5-4.5-2.5-4.5s1.2.9 2 1c-2.3-1-2-3.5-2-3.5s1 .6 1.5.8C4.5 4.8 6 3 6 3s2.3 7.5 9 8.5v-1c0-2 1.5-3.5 3.5-3.5s3 1 3.5 2.5c.5-.2 2-1 2-1s-.5 2-1.5 2.5c1 0 2-.5 2-.5z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 12.5a9 9 0 11-18 0 9 9 0 0118 0zm-9-7.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-4.5 7.5a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0zm6 0a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0zm2.5 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"></path>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white">Home</Link></li>
              <li><Link to="/auth" className="text-gray-300 hover:text-white">Login</Link></li>
              <li><Link to="/auth?register=true" className="text-gray-300 hover:text-white">Register</Link></li>
              <li><a href="#features" className="text-gray-300 hover:text-white">Features</a></li>
              <li><a href="#how-it-works" className="text-gray-300 hover:text-white">How it Works</a></li>
            </ul>
          </div>
          
          {/* Services */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">Import Management</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Export Documentation</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Customs Compliance</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Shipment Tracking</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Data Analytics</a></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-0.5" />
                <span className="text-gray-300">1234 Trade Blvd, Suite 500<br />Global City, 10001</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                <a href="mailto:info@importexport.com" className="text-gray-300 hover:text-white">info@importexport.com</a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} ImportExport Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
