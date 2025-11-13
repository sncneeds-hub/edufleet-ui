/**
 * Image Compression Utility
 * Compresses and optimizes images before upload using browser-image-compression
 */

import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
  initialQuality?: number;
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  dataUrl?: string;
}

/**
 * Compress an image file with default settings optimized for vehicle listings
 */
export async function compressImage(
  file: File,
  options?: CompressionOptions
): Promise<CompressionResult> {
  const defaultOptions: CompressionOptions = {
    maxSizeMB: 2, // Maximum 2MB after compression
    maxWidthOrHeight: 2000, // Max dimension 2000px
    useWebWorker: true, // Use web worker for better performance
    fileType: 'image/jpeg', // Convert to JPEG for better compression
    initialQuality: 0.85, // 85% quality - good balance
    ...options,
  };

  const originalSize = file.size;

  try {
    // Compress the image
    const compressedFile = await imageCompression(file, defaultOptions);

    // Calculate compression ratio
    const compressedSize = compressedFile.size;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    return {
      file: compressedFile,
      originalSize,
      compressedSize,
      compressionRatio,
    };
  } catch (error) {
    console.error('Image compression error:', error);
    throw new Error('Failed to compress image. Please try a different image.');
  }
}

/**
 * Compress an image and get data URL for preview
 */
export async function compressImageWithPreview(
  file: File,
  options?: CompressionOptions
): Promise<CompressionResult> {
  const result = await compressImage(file, options);

  // Generate data URL for preview
  const dataUrl = await imageCompression.getDataUrlFromFile(result.file);

  return {
    ...result,
    dataUrl,
  };
}

/**
 * Compress multiple images in parallel
 */
export async function compressImages(
  files: File[],
  options?: CompressionOptions,
  onProgress?: (index: number, total: number) => void
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const result = await compressImageWithPreview(files[i], options);
      results.push(result);
      onProgress?.(i + 1, files.length);
    } catch (error) {
      console.error(`Failed to compress image ${i + 1}:`, error);
      throw error;
    }
  }

  return results;
}

/**
 * Format file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get image dimensions from file
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Validate image meets minimum requirements
 */
export async function validateImageRequirements(
  file: File
): Promise<{ valid: boolean; error?: string }> {
  try {
    // Check file size (max 10MB before compression)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${formatFileSize(maxSize)}. Current: ${formatFileSize(file.size)}`,
      };
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Only JPEG, PNG, and WebP images are allowed',
      };
    }

    // Check dimensions
    const { width, height } = await getImageDimensions(file);
    
    const minWidth = 400;
    const minHeight = 300;
    
    if (width < minWidth || height < minHeight) {
      return {
        valid: false,
        error: `Image dimensions must be at least ${minWidth}x${minHeight}px. Current: ${width}x${height}px`,
      };
    }

    const maxWidth = 8000;
    const maxHeight = 8000;
    
    if (width > maxWidth || height > maxHeight) {
      return {
        valid: false,
        error: `Image dimensions must not exceed ${maxWidth}x${maxHeight}px. Current: ${width}x${height}px`,
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to validate image. Please try a different file.',
    };
  }
}

/**
 * Advanced image processing for upload with validation and progress tracking
 */
export interface ProcessImagesOptions {
  preset?: 'gallery' | 'profile' | 'document';
  maxImages?: number;
  showToasts?: boolean;
  onProgress?: (fileIndex: number, progress: number) => void;
}

export async function processImagesForUploadAdvanced(
  files: File[],
  options: ProcessImagesOptions = {}
): Promise<File[]> {
  const { preset = 'gallery', maxImages = 10, showToasts = false, onProgress } = options;

  // Limit number of files
  const filesToProcess = files.slice(0, maxImages);

  const processedFiles: File[] = [];
  const errors: string[] = [];

  for (let i = 0; i < filesToProcess.length; i++) {
    const file = filesToProcess[i];
    
    try {
      // Validate file
      onProgress?.(i, 10);
      const validation = await validateImageRequirements(file);
      
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      // Compress based on preset
      onProgress?.(i, 50);
      let compressionOptions: CompressionOptions;
      
      switch (preset) {
        case 'profile':
          compressionOptions = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1000,
            initialQuality: 0.9,
          };
          break;
        case 'document':
          compressionOptions = {
            maxSizeMB: 3,
            maxWidthOrHeight: 2500,
            initialQuality: 0.9,
          };
          break;
        case 'gallery':
        default:
          compressionOptions = {
            maxSizeMB: 2,
            maxWidthOrHeight: 2000,
            initialQuality: 0.85,
          };
      }

      onProgress?.(i, 80);
      const result = await compressImage(file, compressionOptions);
      
      processedFiles.push(result.file);
      onProgress?.(i, 100);
      
      // Show success toast if enabled
      if (showToasts && result.compressionRatio > 0) {
        const toastModule = await import('sonner');
        toastModule.toast.success(
          `${file.name} compressed by ${result.compressionRatio.toFixed(1)}%`,
          { duration: 2000 }
        );
      }
    } catch (error) {
      errors.push(`${file.name}: Compression failed`);
    }
  }

  // Show error toasts if enabled
  if (showToasts && errors.length > 0) {
    const toastModule = await import('sonner');
    errors.forEach(error => toastModule.toast.error(error));
  }

  return processedFiles;
}
