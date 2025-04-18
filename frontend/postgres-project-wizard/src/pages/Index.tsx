
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, ShieldCheck, Globe, TrendingUp, CloudLightning } from 'lucide-react';
import { Button } from '../components/ui/button';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-trade-navy to-trade-blue text-white py-16">
        <div className="trade-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold">
                Streamline Your Global Trade Operations
              </h1>
              <p className="text-xl opacity-90 leading-relaxed">
                Our import-export management platform helps businesses manage international 
                shipping, customs compliance, and trade documentation all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth?register=true">
                  <Button size="lg" className="bg-white text-trade-blue hover:bg-gray-100">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="bg-white text-trade-blue hover:bg-gray-100">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex justify-end">
              <img 
                src="/placeholder.svg" 
                alt="Import Export Management" 
                className="max-w-md rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white" id="features">
        <div className="trade-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powerful Features for Global Trade</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage imports, exports, and compliance in one platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="trade-card p-6">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-trade-blue" />
              </div>
              <h3 className="text-xl font-bold mb-2">Shipment Tracking</h3>
              <p className="text-gray-600">
                Real-time tracking of your shipments from origin to destination with
                detailed status updates at every stage.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="trade-card p-6">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Customs Compliance</h3>
              <p className="text-gray-600">
                Automated customs documentation with built-in compliance checks to ensure
                smooth clearance at international borders.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="trade-card p-6">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Global Trade Network</h3>
              <p className="text-gray-600">
                Connect with a network of trusted suppliers, freight forwarders, and customs
                agents across the globe.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="trade-card p-6">
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Trade Analytics</h3>
              <p className="text-gray-600">
                Powerful reporting tools to analyze your international trade performance,
                costs, and opportunities.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="trade-card p-6">
              <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <CloudLightning className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Quick Processing</h3>
              <p className="text-gray-600">
                Accelerate your import-export operations with our streamlined workflows
                and automated documentation.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="trade-card p-6 flex flex-col items-center justify-center bg-gradient-to-r from-trade-blue to-trade-teal text-white">
              <h3 className="text-xl font-bold mb-4 text-center">Ready to get started?</h3>
              <Link to="/auth?register=true">
                <Button className="bg-white text-trade-blue hover:bg-gray-100">
                  Sign Up Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-trade-gray" id="how-it-works">
        <div className="trade-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform simplifies the complex world of international trade
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-trade-blue w-10 h-10 rounded-full text-white flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Register Your Account</h3>
              <p className="text-gray-600">
                Sign up as a user or company and set up your profile with your trading preferences.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-trade-blue w-10 h-10 rounded-full text-white flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Add Products & Shipments</h3>
              <p className="text-gray-600">
                Enter your product catalog and create shipments with detailed information.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-trade-blue w-10 h-10 rounded-full text-white flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Track & Manage</h3>
              <p className="text-gray-600">
                Monitor shipments in real-time, handle customs compliance, and track transactions.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-trade-navy to-trade-blue text-white">
        <div className="trade-container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Import-Export Operations?</h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of businesses that have simplified their international trade with our platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/auth?register=true">
                <Button size="lg" className="bg-white text-trade-blue hover:bg-gray-100">
                  Get Started Now
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
