'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthContext } from '@/lib/providers/AuthProvider';
import { logout } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
export default function Home() {
  const { user, isAuthenticated, isLoading, refreshProfile } = useAuthContext();
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      await logout();
      // Refresh the profile to update authentication state
      await refreshProfile();
      router.push('/authenticate?type=LOGIN&utm_source=direct');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p>Please wait while we load your profile information.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      {isAuthenticated && user ? (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Landson Management</h1>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-xl font-semibold mb-4">User Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{user.name || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium">{user.phoneNumber || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="font-medium">{user.id}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-xl font-semibold mb-4">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Management Access</p>
                  <p className="font-medium">
                    {user.roles.managementAccess ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <h1 className="text-4xl font-bold mb-4">Landson Management</h1>
          <p className="text-xl mb-6">
            <Button>
              Welcome to Landson Management Software
            </Button>
          </p>
          <Link href="/authenticate?type=LOGIN&utm_source=direct">
            <Button variant="secondary" className="mt-4">
              Sign In / Register
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
