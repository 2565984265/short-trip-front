'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackText?: string;
  fallbackIcon?: string;
}

export default function ImageWithFallback({
  src,
  alt,
  width,
  height,
  className = '',
  fallbackText,
  fallbackIcon = '🖼️',
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width: width, height: height }}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">{fallbackIcon}</div>
          {fallbackText && (
            <div className="text-sm text-gray-500">{fallbackText}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setHasError(true)}
    />
  );
} 