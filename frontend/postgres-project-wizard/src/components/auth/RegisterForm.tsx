import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, Mail, Lock, Phone, Building, Globe } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { post } from '../../lib/api';

const RegisterForm: React.FC = () => {
  const [accountType, setAccountType] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('importer');
  const [contactDetails, setContactDetails] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create the registration payload based on account type
      const registrationData = accountType === 'user' 
        ? { 
            email, 
            password, 
            accountType 
          } 
        : { 
            email, 
            password, 
            accountType,
            // Map the frontend field names to what the backend expects
            name: companyName,
            type: companyType,
            contactDetails
          };
      
      console.log('Registration data:', registrationData);
      
      // Call the backend API registration endpoint
      await post('/auth/register', registrationData);
      
      // Navigate to login page after successful registration
      navigate('/auth');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
        <CardDescription className="text-center">
          Register to start managing your international trade operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister}>
          <Tabs defaultValue="user" onValueChange={setAccountType} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user" className="flex items-center justify-center">
                <User className="mr-2 h-4 w-4" />
                User
              </TabsTrigger>
              <TabsTrigger value="company" className="flex items-center justify-center">
                <Briefcase className="mr-2 h-4 w-4" />
                Company
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="user">
              {/* User registration fields */}
              <div className="grid gap-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="user-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="user-email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="user-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="user-password"
                      type="password"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="user-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="user-confirm-password"
                      type="password"
                      className="pl-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="company">
              {/* Company registration fields */}
              <div className="grid gap-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="company-email">Company Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="company-email"
                      type="email"
                      placeholder="company@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="company-name"
                      type="text"
                      className="pl-10"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="company-type">Company Type</Label>
                  <Select value={companyType} onValueChange={setCompanyType}>
                    <SelectTrigger id="company-type" className="w-full">
                      <SelectValue placeholder="Select company type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="importer">Importer</SelectItem>
                      <SelectItem value="exporter">Exporter</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="contact-details">Contact Details</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="contact-details"
                      type="text"
                      placeholder="Phone number or contact info"
                      className="pl-10"
                      value={contactDetails}
                      onChange={(e) => setContactDetails(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="company-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="company-password"
                      type="password"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="company-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="company-confirm-password"
                      type="password"
                      className="pl-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {error && (
            <div className="bg-red-50 text-red-500 px-4 py-2 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full bg-trade-blue hover:bg-blue-700 mt-4" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <a 
            href="/auth" 
            className="text-trade-blue hover:underline"
            onClick={(e) => {
              e.preventDefault();
              // Handle switching to login form
              window.location.href = '/auth';
            }}
          >
            Sign In
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
