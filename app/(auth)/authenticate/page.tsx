'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { login, requestOtp, verifyOtp, isEmail, isPhoneNumber } from '@/lib/api/auth';
import { useToast } from '@/components/ui/use-toast';
import { useFingerprint } from '@/lib/fingerprint/useFingerprint';
import { getEnhancedDeviceInfo, mapToDeviceInfoDto, DeviceInfoDto } from '@/lib/fingerprint/enhancedFingerprint';
import { useAuthContext } from '@/lib/providers/AuthProvider';

type AuthStep = 'login' | 'email' | 'password' | 'otp';

// Separate component that uses useSearchParams
function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { visitorId, result } = useFingerprint();
  const { isAuthenticated, isLoading: authLoading, refreshProfile } = useAuthContext();
  
  // Get the current step from URL parameters
  const type = searchParams.get('type');
  const utmSource = searchParams.get('utm_source');
  
  // Form state
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [countdown, setCountdown] = useState(60);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfoDto | null>(null);
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);
  
  // Handle URL parameter changes
  useEffect(() => {
    if (type === 'LOGIN' && utmSource === 'direct') {
      setCurrentStep('login');
    } else if (type === 'EMAIL') {
      setCurrentStep('email');
    } else if (type === 'PASSWORD') {
      setCurrentStep('password');
    } else if (type === 'OTP') {
      setCurrentStep('otp');
      // Start countdown when OTP step is shown
      if (!isCountingDown) {
        startCountdown();
      }
    }
  }, [type, utmSource, isCountingDown]);
  
  // Get enhanced device information when component mounts
  useEffect(() => {
    const getDeviceInfo = async () => {
      try {
        const enhancedInfo = await getEnhancedDeviceInfo();
        // Map enhanced device info to the required DTO format
        const deviceInfoDto = mapToDeviceInfoDto(enhancedInfo);
        setDeviceInfo(deviceInfoDto);
      } catch (error) {
        console.error('Error getting device info:', error);
        // Fallback to basic fingerprint if enhanced info fails
        if (visitorId) {
          setDeviceInfo({
            deviceId: visitorId,
            name: 'Unknown Device',
            type: 'Unknown',
            browserName: 'Unknown',
            osName: 'Unknown'
          });
        }
      }
    };
    
    getDeviceInfo();
  }, [visitorId]);
  
  // Countdown timer for OTP resend
  const startCountdown = () => {
    setIsCountingDown(true);
    setCountdown(60);
  };
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isCountingDown && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setIsCountingDown(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, isCountingDown]);
  
  // Handle form submissions
  const handleLoginClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailOrPhone) {
      router.push('/authenticate?type=PASSWORD');
    } else {
      // Show validation error or focus on email/phone field
      const input = document.getElementById('emailOrPhone');
      if (input) {
        input.focus();
      }
      toast({
        title: "Input required",
        description: "Please enter your email or phone number",
        variant: "destructive"
      });
    }
  };
  
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailOrPhone) {
      if (!isEmail(emailOrPhone) && !isPhoneNumber(emailOrPhone)) {
        toast({
          title: "Invalid format",
          description: "Please enter a valid email or phone number",
          variant: "destructive"
        });
        return;
      }
      router.push('/authenticate?type=PASSWORD');
    } else {
      toast({
        title: "Input required",
        description: "Please enter your email or phone number",
        variant: "destructive"
      });
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone || !password) {
      toast({
        title: "Input required",
        description: "Please enter both email/phone and password",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await login(emailOrPhone, password, deviceInfo);
      // Fetch user profile immediately after successful login
      await refreshProfile();
      
      // Handle successful login
      toast({
        title: "Login successful",
        description: "You have been logged in successfully",
        variant: "default"
      });
      
      // If we get here, the user has management access (otherwise they would have been redirected)
      // Redirect to dashboard or home page
      router.push('/');
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRequestOtp = async () => {
    if (!emailOrPhone) {
      toast({
        title: "Input required",
        description: "Please enter your email or phone number",
        variant: "destructive"
      });
      return;
    }
    
    if (!isEmail(emailOrPhone) && !isPhoneNumber(emailOrPhone)) {
      toast({
        title: "Invalid format",
        description: "Please enter a valid email or phone number",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await requestOtp(emailOrPhone);
      toast({
        title: "OTP Sent",
        description: `A one-time password has been sent to ${emailOrPhone}`,
        variant: "default"
      });
      router.push('/authenticate?type=OTP');
      startCountdown();
    } catch (error: any) {
      toast({
        title: "Failed to send OTP",
        description: error.message || "An error occurred while sending OTP",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone || !otp) {
      toast({
        title: "Input required",
        description: "Please enter the OTP sent to your email/phone",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await verifyOtp(emailOrPhone, otp, deviceInfo);
      // Fetch user profile immediately after successful OTP verification
      await refreshProfile();
      
      toast({
        title: "Authentication successful",
        description: "You have been logged in successfully",
        variant: "default"
      });
      
      // If we get here, the user has management access (otherwise they would have been redirected)
      // Redirect to dashboard or home page
      router.push('/');
    } catch (error: any) {
      toast({
        title: "OTP verification failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendOtp = async () => {
    if (!emailOrPhone) {
      toast({
        title: "Input required",
        description: "Email or phone number is missing",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await requestOtp(emailOrPhone);
      toast({
        title: "OTP Resent",
        description: `A new one-time password has been sent to ${emailOrPhone}`,
        variant: "default"
      });
      startCountdown();
    } catch (error: any) {
      toast({
        title: "Failed to resend OTP",
        description: error.message || "An error occurred while resending OTP",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render different steps based on the current step
  const renderStep = () => {
    switch (currentStep) {
      case 'login':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center text-gray-800">Welcome Back</h2>
            <p className="text-center text-gray-600">Sign in to access your account</p>
            <form onSubmit={handleLoginClick} className="space-y-4">
              <div>
                <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Email or Phone Number
                </label>
                <input
                  id="emailOrPhone"
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your email or phone number"
                  required
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Continue'}
              </Button>
            </form>
          </div>
        );
        
      case 'email':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center text-gray-800">Enter Email or Phone</h2>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Email or Phone Number
                </label>
                <input
                  id="emailOrPhone"
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your email or phone number"
                  required
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Continue'}
              </Button>
            </form>
            <Button 
              variant="outline" 
              className="w-full border-green-600 text-green-600 hover:bg-green-50"
              onClick={() => router.push('/authenticate?type=LOGIN&utm_source=direct')}
            >
              Back
            </Button>
          </div>
        );
        
      case 'password':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center text-gray-800">Enter Password</h2>
            <p className="text-center text-gray-600">{emailOrPhone}</p>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                className="w-full bg-green-100 text-green-800 hover:bg-green-200"
                onClick={handleRequestOtp}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Request OTP Instead'}
              </Button>
            </form>
            <div className="text-center">
              <Link href="#" className="text-sm text-green-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <Button 
              variant="outline" 
              className="w-full border-green-600 text-green-600 hover:bg-green-50"
              onClick={() => router.push('/authenticate?type=EMAIL')}
            >
              Back
            </Button>
          </div>
        );
        
      case 'otp':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center text-gray-800">Enter OTP</h2>
            <p className="text-center text-gray-600">We've sent a one-time password to {emailOrPhone}</p>
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  One-Time Password
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter the OTP"
                  maxLength={6}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify & Sign In'}
              </Button>
            </form>
            <div className="text-center">
              {isCountingDown ? (
                <p className="text-sm text-gray-600">
                  Resend OTP in <span className="font-medium text-green-600">{countdown}</span> seconds
                </p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="text-sm text-green-600 hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>
            <Button 
              variant="outline" 
              className="w-full border-green-600 text-green-600 hover:bg-green-50"
              onClick={() => router.push('/authenticate?type=PASSWORD')}
            >
              Back
            </Button>
          </div>
        );
        
      default:
        return (
          <div className="text-center">
            <p>Something went wrong. Please try again.</p>
            <Button 
              className="mt-4" 
              onClick={() => router.push('/authenticate?type=LOGIN&utm_source=direct')}
            >
              Go to Login
            </Button>
          </div>
        );
    }
  };
  
  return (
    <div className="w-full">
      {renderStep()}
    </div>
  );
}

// Main component that wraps the content in Suspense
export default function AuthenticatePage() {
  return (
    <Suspense fallback={<div className="w-full text-center p-8">Loading authentication...</div>}>
      <AuthContent />
    </Suspense>
  );
}