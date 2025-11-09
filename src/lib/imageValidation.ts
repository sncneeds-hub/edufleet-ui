import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

export interface ImageDimensions {
  width: number;
  height: number;
}

// Image validation constants
export const IMAGE_VALIDATION = {
  MAX_SIZE_MB: 5,
  MAX_COMPRESSED_SIZE_MB: 2,
  MIN_WIDTH: 400,
  MIN_HEIGHT: 300,
  MAX_WIDTH: 4000,
  MAX_HEIGHT: 3000,
  ALLOWED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  RECOMMENDED_ASPECT_RATIOS: [
    { ratio: 3 / 2, label: '3:2' },
    { ratio: 16 / 9, label: '16:9' },
    { ratio: 4 / 3, label: '4:3' },
  ],
};

/**
 * Get image dimensions from file
 */
export const getImageDimensions = (file: File): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};

/**
 * Check if aspect ratio is close to recommended ratios
 */
const checkAspectRatio = (width: number, height: number): string | null => {
  const aspectRatio = width / height;
  const tolerance = 0.1; // 10% tolerance

  for (const { ratio, label } of IMAGE_VALIDATION.RECOMMENDED_ASPECT_RATIOS) {
    if (Math.abs(aspectRatio - ratio) / ratio <= tolerance) {
      return null; // Good aspect ratio
    }
  }

  return `Image aspect ratio (${aspectRatio.toFixed(2)}) is unusual. Recommended: 3:2, 16:9, or 4:3`;
};

/**
 * Validate image file before upload
 */
export const validateImageFile = async (
  file: File
): Promise<ImageValidationResult> => {
  const warnings: string[] = [];

  // Check file type
  if (!IMAGE_VALIDATION.ALLOWED_FORMATS.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file format. Only JPEG, PNG, and WebP images are allowed.`,
    };
  }

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > IMAGE_VALIDATION.MAX_SIZE_MB) {
    return {
      valid: false,
      error: `File size (${fileSizeMB.toFixed(1)}MB) exceeds maximum allowed size of ${IMAGE_VALIDATION.MAX_SIZE_MB}MB.`,
    };
  }

  // Get image dimensions
  try {
    const dimensions = await getImageDimensions(file);

    // Check minimum dimensions
    if (
      dimensions.width < IMAGE_VALIDATION.MIN_WIDTH ||
      dimensions.height < IMAGE_VALIDATION.MIN_HEIGHT
    ) {
      return {
        valid: false,
        error: `Image dimensions (${dimensions.width}x${dimensions.height}) are too small. Minimum: ${IMAGE_VALIDATION.MIN_WIDTH}x${IMAGE_VALIDATION.MIN_HEIGHT}px.`,
      };
    }

    // Check maximum dimensions
    if (
      dimensions.width > IMAGE_VALIDATION.MAX_WIDTH ||
      dimensions.height > IMAGE_VALIDATION.MAX_HEIGHT
    ) {
      warnings.push(
        `Image dimensions (${dimensions.width}x${dimensions.height}) are very large. Will be resized during compression.`
      );
    }

    // Check aspect ratio
    const aspectRatioWarning = checkAspectRatio(
      dimensions.width,
      dimensions.height
    );
    if (aspectRatioWarning) {
      warnings.push(aspectRatioWarning);
    }

    return { valid: true, warnings: warnings.length > 0 ? warnings : undefined };
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to read image file. Please ensure the file is a valid image.',
    };
  }
};

/**
 * Compress image file
 */
export const compressImage = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<File> => {
  const options = {
    maxSizeMB: IMAGE_VALIDATION.MAX_COMPRESSED_SIZE_MB,
    maxWidthOrHeight: 2000,
    useWebWorker: true,
    fileType: 'image/webp' as const,
    onProgress: (progress: number) => {
      if (onProgress) {
        onProgress(progress);
      }
    },
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error('Failed to compress image. Please try a different file.');
  }
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate and compress image with user feedback
 */
export const processImageForUpload = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<File> => {
  // Step 1: Validate
  const validation = await validateImageFile(file);

  if (!validation.valid) {
    toast.error(validation.error || 'Invalid image file');
    throw new Error(validation.error);
  }

  // Show warnings if any
  if (validation.warnings && validation.warnings.length > 0) {
    validation.warnings.forEach((warning) => toast(warning, { icon: '⚠️' }));
  }

  // Step 2: Compress
  const originalSizeMB = file.size / (1024 * 1024);

  if (originalSizeMB > IMAGE_VALIDATION.MAX_COMPRESSED_SIZE_MB) {
    toast.loading('Compressing image...', { id: 'compress' });

    try {
      const compressedFile = await compressImage(file, onProgress);
      const compressedSizeMB = compressedFile.size / (1024 * 1024);
      const reduction = ((1 - compressedSizeMB / originalSizeMB) * 100).toFixed(
        0
      );

      toast.success(
        `Image compressed: ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)} (${reduction}% smaller)`,
        { id: 'compress', duration: 3000 }
      );

      return compressedFile;
    } catch (error) {
      toast.error('Compression failed. Using original file.', {
        id: 'compress',
      });
      return file;
    }
  } else {
    // File is already small enough
    toast.success(`Image ready (${formatFileSize(file.size)})`, {
      duration: 2000,
    });
    return file;
  }
};

/**
 * Process multiple images for upload
 */
export const processImagesForUpload = async (
  files: File[],
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<File[]> => {
  const processedFiles: File[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const processed = await processImageForUpload(file, (progress) => {
        if (onProgress) {
          onProgress(i, progress);
        }
      });
      processedFiles.push(processed);
    } catch (error) {
      console.error(`Failed to process image ${i + 1}:`, error);
      // Skip failed images
    }
  }

  return processedFiles;
};
