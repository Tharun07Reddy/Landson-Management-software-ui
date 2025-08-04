'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Users, Settings, ArrowRight, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Landson Management</h1>
                <p className="text-sm text-slate-600">Administrative Portal</p>
              </div>
            </div>
            <Link href="/authenticate">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Lock className="mr-2 h-4 w-4" />
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full mb-6">
            <Lock className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Access Restricted
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            This is a secure management portal designed exclusively for authorized administrators and staff members.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/authenticate">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Lock className="mr-2 h-5 w-5" />
                Administrator Access
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" onClick={() => window.location.href = 'mailto:admin@landsonmanagement.com'}>
              <Mail className="mr-2 h-5 w-5" />
              Request Access
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 mx-auto">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">User Management</CardTitle>
              <CardDescription>
                Comprehensive user administration and access control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• User account creation and management</li>
                <li>• Role-based access control</li>
                <li>• Activity monitoring and logs</li>
                <li>• Permission management</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 mx-auto">
                <Settings className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">System Configuration</CardTitle>
              <CardDescription>
                Advanced system settings and configuration management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• System-wide settings control</li>
                <li>• Security configuration</li>
                <li>• Integration management</li>
                <li>• Performance optimization</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 mx-auto">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Security & Compliance</CardTitle>
              <CardDescription>
                Enterprise-grade security and compliance tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Multi-factor authentication</li>
                <li>• Audit trails and reporting</li>
                <li>• Data encryption and protection</li>
                <li>• Compliance monitoring</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Access Information */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-slate-900">Need Access?</CardTitle>
            <CardDescription className="text-lg">
              Contact your system administrator for access credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Email Support</h3>
                <p className="text-slate-600 mb-4">Send us an email for access requests</p>
                <Button variant="outline" onClick={() => window.location.href = 'mailto:admin@landsonmanagement.com'}>
                  admin@landsonmanagement.com
                </Button>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Phone Support</h3>
                <p className="text-slate-600 mb-4">Call during business hours</p>
                <Button variant="outline" onClick={() => window.location.href = 'tel:+1234567890'}>
                  +1 (234) 567-8900
                </Button>
              </div>
            </div>
            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900 mb-1">Security Notice</h4>
                  <p className="text-sm text-amber-800">
                    This portal contains sensitive administrative functions. Access is restricted to authorized personnel only. 
                    All access attempts are logged and monitored for security purposes.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-slate-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-slate-600" />
              <span className="font-semibold text-slate-900">Landson Management Portal</span>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Secure administrative access for authorized personnel only
            </p>
            <div className="flex justify-center gap-6 text-sm text-slate-500">
              <span>© 2024 Landson Management</span>
              <span>•</span>
              <span>All rights reserved</span>
              <span>•</span>
              <span>Secure Portal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}