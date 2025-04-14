import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, Mail, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { post } from '../../lib/api';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('user');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Connect to the backend API using our api service
      console.log('Login attempt:', { email, accountType });
      
      const response = await post('/auth/login', {
        email,
        password,
        accountType
      });
      
      console.log('Login response:', response);
      
      // Handle successful login
      localStorage.setItem('userType', accountType);
      localStorage.setItem('token', response.token);
      
      // Navigate to the appropriate dashboard
      const userTypeRoute = accountType === 'user' ? '/user-dashboard' : '/company-dashboard';
      navigate(userTypeRoute);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Login</CardTitle>
        <CardDescription className="text-center">
          Sign in to your account to manage your imports and exports
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin}>
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
          </Tabs>
          
          {error && (
            <div className="bg-red-50 text-red-500 px-4 py-2 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm text-trade-blue hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full bg-trade-blue hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <a 
            href="/auth?register=true" 
            className="text-trade-blue hover:underline"
            onClick={(e) => {
              e.preventDefault();
              // Handle switching to registration form
              window.location.href = '/auth?register=true';
            }}
          >
            Register
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
