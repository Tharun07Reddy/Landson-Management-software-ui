'use client';

import * as React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { X, Upload, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { uploadSingleImage } from '@/lib/api/upload';

export interface ImageUploadProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onImageUpload?: (file: File) => Promise<string | void>;
  onChange?: (url: string) => void;
  onRemove?: () => void;
  value?: string;
  initialImage?: string;
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
  showPreview?: boolean;
  aspectRatio?: string;
  previewSize?: 'sm' | 'md' | 'lg' | 'full';
}

const defaultAcceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function ImageUpload({
  onImageUpload,
  onChange,
  onRemove,
  value,
  initialImage,
  maxSizeMB = 5,
  acceptedTypes = defaultAcceptedTypes,
  className,
  buttonClassName,
  previewClassName,
  dropzoneText = 'Drag & drop an image here, or click to select',
  buttonText = 'Select Image',
  loadingText = 'Uploading...',
  errorSizeText = 'Image size exceeds the maximum allowed size',
  errorTypeText = 'Invalid file type. Please upload a valid image',
  showPreview = true,
  aspectRatio = '1/1',
  previewSize = 'md',
  disabled,
  ...props
}: ImageUploadProps) {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(value || initialImage || null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Sync with external value changes
  useEffect(() => {
    setImage(value || null);
  }, [value]);

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

  const handleImageChange = async (file: File) => {
    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: 'Error',
        description: errorSizeText,
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      toast({
        title: 'Error',
        description: errorTypeText,
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const progressInterval = simulateProgress();

      // Create a local preview first for immediate feedback
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImage(result);
      };
      reader.readAsDataURL(file);

      // Upload to backend API
      let uploadedUrl: string;
      if (onImageUpload) {
        // Use custom upload handler if provided
        const result = await onImageUpload(file);
        uploadedUrl = typeof result === 'string' ? result : '';
      } else {
        // Use default backend upload
        uploadedUrl = await uploadSingleImage(file);
      }

      // Update with the actual uploaded URL
      if (uploadedUrl) {
        setImage(uploadedUrl);
        // Call onChange callback if provided
        if (onChange) {
          onChange(uploadedUrl);
        }
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
        setIsLoading(false);
      }, 500);

      toast({
        title: 'Upload Successful',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'There was an error uploading your image. Please try again.',
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
    const file = e.target.files?.[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    if (onRemove) {
      onRemove();
    }
    if (onChange) {
      onChange('');
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
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const previewSizeClasses = {
    sm: 'h-32 w-32',
    md: 'h-48 w-48',
    lg: 'h-64 w-64',
    full: 'w-full h-auto max-h-[300px]',
  };

  return (
    <div className={cn('space-y-4', className)}>
      {!image && (
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
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className={cn('mt-2', buttonClassName)}
              disabled={disabled || isLoading}
            >
              {buttonText}
            </Button>
          </div>
        </div>
      )}

      {showPreview && image && (
        <div className="relative">
          <div 
            className={cn(
              'relative rounded-lg overflow-hidden border border-border',
              previewSizeClasses[previewSize],
              previewClassName
            )}
            style={{ aspectRatio }}
          >
            <img
              src={image}
              alt="Preview"
              className="object-cover w-full h-full"
            />
            {isLoading && uploadProgress > 0 && (
              <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                <RefreshCw className="h-8 w-8 text-primary animate-spin mb-2" />
                <p className="text-sm font-medium">{loadingText}</p>
                <div className="w-3/4 h-2 bg-muted rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{uploadProgress}%</p>
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemoveImage}
            disabled={disabled || isLoading}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept={acceptedTypes.join(',')}
        onChange={handleFileChange}
        disabled={disabled || isLoading}
        {...props}
      />
    </div>
  );
}