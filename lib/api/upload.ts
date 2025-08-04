/**
 * Upload API Service
 * 
 * This service handles file uploads to the backend API.
 */

import { apiConfig } from './config';
import { useToast } from '@/components/ui/use-toast';

// Types for upload responses
export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    originalName: string;
    filename: string;
    mimeType: string;
    size: number;
    url: string;
    key: string;
    bucket: string;
    uploadedAt: string;
    metadata: {
      userId: string | null;
      userEmail: string;
      uploadMetadata: {
        uploadId: string;
        timestamp: string;
        userAgent: string;
        clientIp: string;
        userId: string | null;
      };
      optimized: boolean;
      originalSize: number;
      compressionRatio: number;
    };
  };
}

export interface MultiUploadResponse {
  success: boolean;
  message: string;
  data: {
    successful: UploadResponse['data'][];
    failed: any[];
    totalFiles: number;
    successCount: number;
    failureCount: number;
  };
}

/**
 * Upload a single image file
 * @param file - The file to upload
 * @returns Promise with the uploaded file URL
 */
export const uploadSingleImage = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${apiConfig.baseUrl}/upload/single`, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type header, let the browser set it with boundary
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result: UploadResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Upload failed');
    }

    return result.data.url;
  } catch (error) {
    console.error('Single image upload error:', error);
    throw error;
  }
};

/**
 * Upload multiple image files
 * @param files - Array of files to upload
 * @returns Promise with array of uploaded file URLs
 */
export const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
  try {
    const formData = new FormData();
    
    // Append all files with the key 'files'
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(`${apiConfig.baseUrl}/upload/multiple`, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type header, let the browser set it with boundary
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result: MultiUploadResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Upload failed');
    }

    // Return URLs from successful uploads
    return result.data.successful.map(item => item.url);
  } catch (error) {
    console.error('Multiple images upload error:', error);
    throw error;
  }
};

/**
 * Hook for single image upload with toast notifications
 */
export const useSingleImageUpload = () => {
  const { toast } = useToast();

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const url = await uploadSingleImage(file);
      
      toast({
        title: 'Upload Successful',
        description: 'Image uploaded successfully',
      });
      
      return url;
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return { uploadImage };
};

/**
 * Hook for multiple images upload with toast notifications
 */
export const useMultipleImagesUpload = () => {
  const { toast } = useToast();

  const uploadImages = async (files: File[]): Promise<string[]> => {
    try {
      const urls = await uploadMultipleImages(files);
      
      toast({
        title: 'Upload Successful',
        description: `Successfully uploaded ${urls.length} ${urls.length === 1 ? 'image' : 'images'}`,
      });
      
      return urls;
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload images',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return { uploadImages };
};