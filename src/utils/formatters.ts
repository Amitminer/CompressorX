/**
 * Formatters Module
 * 
 * This module provides utility functions for formatting various data types
 * into human-readable strings.
 */

/**
 * Formats a duration in seconds into a human-readable time string
 * 
 * @param seconds - Duration in seconds
 * @returns Formatted time string (HH:MM:SS or MM:SS)
 * 
 * @example
 * formatDuration(3661) // returns "1:01:01"
 * formatDuration(65)   // returns "1:05"
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

/**
 * Formats a file size in bytes into a human-readable string
 * 
 * @param bytes - File size in bytes
 * @returns Formatted size string with appropriate unit (B, KB, MB, GB, TB)
 * 
 * @example
 * formatFileSize(1024)    // returns "1.00 KB"
 * formatFileSize(1048576) // returns "1.00 MB"
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
} 