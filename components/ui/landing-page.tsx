"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Shield, Users, FileText, Phone, Mail, CheckCircle, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onSignInClick: () => void;
}

const handlecustomersite = ()=>{
  window.location.href = 'http://localhost:3001';
}

export function LandingPage({ onSignInClick }: LandingPageProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-white to-green-100 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-green-100 shadow-lg sticky top-0 z-50 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 w-full">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-base sm:text-xl font-bold text-gray-900">
                Landson agri
              </span>
            </div>
            <div>
              <Button
                onClick={handlecustomersite}
                variant="outline"
                className="border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-700 text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2"
              >
                Customers Site
                <ArrowRight className="ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
            <div>
              <Button
                onClick={onSignInClick}
                variant="outline"
                className="border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-700 text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2"
              >
                Sign In
                <ArrowRight className="ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 w-full">
        {/* Hero Section */}
        <div className="text-center mb-16 lg:mb-24 w-full px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-2xl mb-6 transform hover:scale-110 transition-transform duration-300">
              <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Landson Management Portal
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Secure access to your management dashboard. Please sign in to continue.
          </p>
          <Button 
            onClick={onSignInClick}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 sm:px-8 py-4 sm:py-6 rounded-xl text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Sign In to Dashboard
            <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>


        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-16 lg:mb-24 w-full">
          <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-green-50 border-green-100 h-full">
            <CardContent className="p-6 lg:p-8 h-full flex flex-col">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">User Management</h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Comprehensive user administration and access control system.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Role-based permissions
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Activity monitoring
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Secure authentication
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-green-50 border-green-100">
            <CardContent className="p-6 lg:p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Document Control</h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Secure document management with version control and audit trails.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Version tracking
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Access logging
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Encrypted storage
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-green-50 border-green-100 md:col-span-2 lg:col-span-1 h-full">
            <CardContent className="p-6 lg:p-8 h-full flex flex-col">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Security Center</h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Advanced security monitoring and threat detection capabilities.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Real-time monitoring
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Threat detection
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Compliance reporting
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Access Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-16 w-full">
          <Card className="bg-gradient-to-br from-white to-green-50 border-green-100 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
            <CardContent className="p-6 lg:p-8 h-full flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Need Access?</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Contact your system administrator or IT department to request access credentials.
              </p>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-green-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center mr-4">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">IT Support</p>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-green-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mr-4">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Email Support</p>
                    <p className="text-gray-600">support@landsonmanagement.com</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-red-50 border-red-100 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
            <CardContent className="p-6 lg:p-8 h-full flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Security Notice</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-600 leading-relaxed">
                    All access attempts are logged and monitored for security purposes.
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-600 leading-relaxed">
                    Unauthorized access attempts will be reported to security personnel.
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-600 leading-relaxed">
                    This system complies with industry security standards and regulations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-t border-gray-700 shadow-2xl w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between w-full">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-base sm:text-xl font-bold">Landson Management Portal</span>
            </div>
            <p className="text-gray-400 text-center md:text-right text-sm sm:text-base">
              © {new Date().getFullYear()} Landson Management. All rights reserved. | Secure Access Portal
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}