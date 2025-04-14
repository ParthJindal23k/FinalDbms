
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isRegister, setIsRegister] = useState(false);
  
  useEffect(() => {
    const registerParam = searchParams.get('register');
    setIsRegister(registerParam === 'true');
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-1 flex items-center justify-center bg-trade-light-blue py-12">
        <div className="w-full max-w-md px-4">
          {isRegister ? <RegisterForm /> : <LoginForm />}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Auth;
