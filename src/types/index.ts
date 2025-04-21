/**
 * Type Definitions Module
 * 
 * This module contains all the TypeScript interfaces used throughout the application.
 */

/**
 * Settings for video compression
 */
export interface CompressionSettings {
  /** Video bitrate in kilobits per second (kbps) */
  bitrate: number;
  /** Buffer size in kilobits per second (kbps) */
  buffer_size: number;
  /** Target resolution ("original", "720p", "480p", "360p") */
  resolution: string;
  /** Optional width for custom resolution */
  width?: number;
  /** Optional height for custom resolution */
  height?: number;
}

/**
 * Results of a video compression operation
 */
export interface CompressionResult {
  /** Whether the compression was successful */
  success: boolean;
  /** Path to the compressed output file */
  output_path: string;
  /** Size of the original file in bytes */
  original_size: number;
  /** Size of the compressed file in bytes */
  compressed_size: number;
  /** Compression ratio as a percentage */
  compression_ratio: number;
  /** Error message if compression failed */
  error_message?: string;
}

/**
 * Video metadata information
 */
export interface VideoInfo {
  /** Video and audio streams information */
  streams: Array<{
    /** Type of stream (video, audio, etc.) */
    codec_type: string;
    /** Video width in pixels (if video stream) */
    width?: number;
    /** Video height in pixels (if video stream) */
    height?: number;
  }>;
  /** Format information */
  format: {
    /** Duration in seconds */
    duration: number;
    /** File size in bytes */
    size: number;
  };
} 

