'use client';

import React from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthContext } from '@/lib/providers/AuthProvider';
import { logout } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/ui/image-upload';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { LandingPage } from '@/components/ui/landing-page';
import { Shield, Lock, Users, Settings, ArrowRight, Mail, Phone } from 'lucide-react';
export default function Home() {
  const { user, isAuthenticated, isLoading, refreshProfile } = useAuthContext();
  const router = useRouter();
  const { toast } = useToast();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
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
  
  // Simulate image upload to server
  const handleImageUpload = async (file: File): Promise<string> => {
    // This would normally be an API call to upload the image
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        // Create a local URL for the file
        const imageUrl = URL.createObjectURL(file);
        setUploadedImage(imageUrl);
        toast({
          title: 'Image Uploaded',
          description: `Successfully uploaded ${file.name}`,
        });
        resolve(imageUrl);
      }, 1500);
    });
  };
  
  // Simulate multiple images upload to server
  const handleMultiImageUpload = async (files: File[]): Promise<string[]> => {
    // This would normally be an API call to upload multiple images
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        // Create local URLs for the files
        const imageUrls = files.map(file => URL.createObjectURL(file));
        setUploadedImages(prev => [...prev, ...imageUrls]);
        resolve(imageUrls);
      }, 2000);
    });
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
    <div className={isAuthenticated && user ? "container py-8" : "w-full"}>
      {isAuthenticated && user ? (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Landson Management</h1>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-xl font-semibold mb-4">User Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 flex flex-col items-center mb-4">
                  <ImageUpload
                    initialImage={profileImage || user.profileImage}
                    onImageUpload={async (file) => {
                      const url = await handleImageUpload(file);
                      setProfileImage(url as string);
                      return url;
                    }}
                    previewSize="md"
                    dropzoneText="Upload profile picture"
                    buttonText="Change Photo"
                  />
                </div>
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
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-xl font-semibold mb-4">Image Upload Demo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium mb-2">Standard Upload</h3>
                  <ImageUpload 
                    onImageUpload={handleImageUpload}
                    maxSizeMB={2}
                    previewSize="md"
                  />
                </div>
                <div>
                  <h3 className="text-md font-medium mb-2">Custom Aspect Ratio (16:9)</h3>
                  <ImageUpload 
                    onImageUpload={handleImageUpload}
                    aspectRatio="16/9"
                    previewSize="full"
                    dropzoneText="Upload landscape image"
                  />
                </div>
                <div>
                  <h3 className="text-md font-medium mb-2">Small Preview</h3>
                  <ImageUpload 
                    onImageUpload={handleImageUpload}
                    previewSize="sm"
                    buttonText="Upload Small text"
                  />
                </div>
                <div>
                  <h3 className="text-md font-medium mb-2">Large Preview</h3>
                  <ImageUpload 
                    onImageUpload={handleImageUpload}
                    previewSize="lg"
                    buttonText="Upload Large"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-xl font-semibold mb-4">Multi-Image Upload Demo</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium mb-2">Upload Multiple Images</h3>
                  <MultiImageUpload 
                    onImagesUpload={handleMultiImageUpload}
                    initialImages={uploadedImages}
                    maxSizeMB={2}
                    previewSize="md"
                    maxImages={5}
                    maxImagesText="You can upload a maximum of 5 images"
                  />
                </div>
                <div>
                  <h3 className="text-md font-medium mb-2">Gallery Style (16:9)</h3>
                  <MultiImageUpload 
                    onImagesUpload={handleMultiImageUpload}
                    aspectRatio="16/9"
                    previewSize="sm"
                    dropzoneText="Upload gallery images"
                    maxImages={10}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <LandingPage onSignInClick={() => window.location.href = '/authenticate?type=LOGIN&utm_source=direct'} />
      )}
    </div>
  );
}
