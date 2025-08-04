'use client';

import * as React from 'react';
import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { X, Upload, Image as ImageIcon, RefreshCw, Plus } from 'lucide-react';
import { uploadMultipleImages } from '@/lib/api/upload';

export interface MultiImageUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onImagesUpload?: (files: File[]) => Promise<string[] | void>;
  onImageRemove?: (index: number) => void;
  initialImages?: string[];
  maxSizeMB?: number;
  acceptedTypes?: string[];
  className?: string;
  buttonClassName?: string;
  previewClassName?: string;
  dropzoneText?: string;
  buttonText?: string;
  loadingText?: string;
  errorSizeText?: string;
  errorTypeText?: string;
  showPreviews?: boolean;
  aspectRatio?: string;
  previewSize?: 'sm' | 'md' | 'lg' | 'full';
  maxImages?: number;
  maxImagesText?: string;
}

const defaultAcceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function MultiImageUpload({
  onImagesUpload,
  onImageRemove,
  initialImages = [],
  maxSizeMB = 5,
  acceptedTypes = defaultAcceptedTypes,
  className,
  buttonClassName,
  previewClassName,
  dropzoneText = 'Drag & drop images here, or click to select',
  buttonText = 'Select Images',
  loadingText = 'Uploading...',
  errorSizeText = 'Image size exceeds the maximum allowed size',
  errorTypeText = 'Invalid file type. Please upload a valid image',
  showPreviews = true,
  aspectRatio = '1/1',
  previewSize = 'md',
  maxImages = 10,
  maxImagesText = 'Maximum number of images reached',
  disabled,
  ...props
}: MultiImageUploadProps) {
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>(initialImages || []);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Simulate progress for better UX
  const simulateProgress = useCallback(() => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 100);
    progressIntervalRef.current = interval;
    return interval;
  }, []);

  const handleImagesChange = async (files: File[]) => {
    if (images.length + files.length > maxImages) {
      toast({
        title: 'Error',
        description: maxImagesText,
        variant: 'destructive',
      });
      return;
    }

    // Validate files
    const validFiles: File[] = [];
    const invalidSizeFiles: string[] = [];
    const invalidTypeFiles: string[] = [];

    for (const file of files) {
      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        invalidSizeFiles.push(file.name);
        continue;
      }

      // Validate file type
      if (!acceptedTypes.includes(file.type)) {
        invalidTypeFiles.push(file.name);
        continue;
      }

      validFiles.push(file);
    }

    // Show error messages if any
    if (invalidSizeFiles.length > 0) {
      toast({
        title: 'Size Error',
        description: `${invalidSizeFiles.join(', ')} ${invalidSizeFiles.length > 1 ? 'exceed' : 'exceeds'} the maximum allowed size of ${maxSizeMB}MB`,
        variant: 'destructive',
      });
    }

    if (invalidTypeFiles.length > 0) {
      toast({
        title: 'Type Error',
        description: `${invalidTypeFiles.join(', ')} ${invalidTypeFiles.length > 1 ? 'are' : 'is'} not a valid image type`,
        variant: 'destructive',
      });
    }

    if (validFiles.length === 0) return;

    try {
      setIsLoading(true);
      const progressInterval = simulateProgress();

      // Create local previews for immediate feedback
      const newImagePreviews: string[] = [];
      const fileReadPromises = validFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            resolve(result);
          };
          reader.readAsDataURL(file);
        });
      });

      const previews = await Promise.all(fileReadPromises);
      newImagePreviews.push(...previews);
      
      // Set local previews first for immediate feedback
      setImages(prev => [...prev, ...newImagePreviews]);

      // Upload to backend API
      let uploadedUrls: string[];
      if (onImagesUpload) {
        // Use custom upload handler if provided
        const result = await onImagesUpload(validFiles);
        uploadedUrls = Array.isArray(result) ? result : [];
      } else {
        // Use default backend upload
        uploadedUrls = await uploadMultipleImages(validFiles);
      }

      // Replace local previews with actual uploaded URLs
      if (uploadedUrls.length > 0) {
        setImages(prev => {
          // Remove the local previews we just added
          const withoutPreviews = prev.slice(0, prev.length - newImagePreviews.length);
          // Add the uploaded URLs
          return [...withoutPreviews, ...uploadedUrls];
        });
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
        setIsLoading(false);
      }, 500);

      // Show success message
      toast({
        title: 'Upload Successful',
        description: `Successfully uploaded ${validFiles.length} ${validFiles.length === 1 ? 'image' : 'images'}`,
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: 'Upload Failed',
        description: 'There was an error uploading your images. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
      setUploadProgress(0);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const filesArray = Array.from(fileList);
      handleImagesChange(filesArray);
      // Reset the input value to allow selecting the same files again
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if (onImageRemove) {
      onImageRemove(index);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      handleImagesChange(filesArray);
    }
  };

  const previewSizeClasses = {
    sm: 'h-24 w-24',
    md: 'h-32 w-32',
    lg: 'h-48 w-48',
    full: 'w-full h-auto max-h-[200px]',
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent/50',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onDragOver={!disabled ? handleDragOver : undefined}
        onDragLeave={!disabled ? handleDragLeave : undefined}
        onDrop={!disabled ? handleDrop : undefined}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-3 rounded-full bg-primary/10">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">{dropzoneText}</p>
            <p className="text-xs text-muted-foreground">
              Max size: {maxSizeMB}MB. Supported formats: {acceptedTypes.map(type => type.split('/')[1]).join(', ')}
            </p>
            <p className="text-xs text-muted-foreground">
              {images.length} of {maxImages} images uploaded
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className={cn('mt-2', buttonClassName)}
            disabled={disabled || isLoading || images.length >= maxImages}
          >
            {buttonText}
          </Button>
        </div>
      </div>

      {showPreviews && images.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Uploaded Images ({images.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div 
                  className={cn(
                    'relative rounded-lg overflow-hidden border border-border group-hover:border-primary transition-colors',
                    previewSizeClasses[previewSize],
                    previewClassName
                  )}
                  style={{ aspectRatio }}
                >
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-80 group-hover:opacity-100"
                  onClick={() => handleRemoveImage(index)}
                  disabled={disabled || isLoading}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && uploadProgress > 0 && (
        <div className="bg-accent/50 p-4 rounded-md">
          <div className="flex items-center space-x-3 mb-2">
            <RefreshCw className="h-5 w-5 text-primary animate-spin" />
            <p className="text-sm font-medium">{loadingText}</p>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-right">{uploadProgress}%</p>
        </div>
      )}

      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept={acceptedTypes.join(',')}
        onChange={handleFileChange}
        disabled={disabled || isLoading || images.length >= maxImages}
        multiple
        {...props}
      />
    </div>
  );
}