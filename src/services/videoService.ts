/**
 * Video Service Module
 * 
 * This module provides services for video file operations including:
 * - File selection and saving
 * - Video metadata retrieval
 * - Video compression
 * - File opening
 */

import { invoke } from "@tauri-apps/api/core";
import { CompressionSettings, CompressionResult, VideoInfo } from "../types";
import { listen } from "@tauri-apps/api/event";

/**
 * Opens a file picker dialog to select a video file
 * 
 * @returns Promise resolving to the selected file path or null if cancelled
 * @throws Error if file selection fails
 */
export async function selectVideoFile(): Promise<string | null> {
  try {
    return await invoke<string | null>("select_video_file");
  } catch (error) {
    console.error("Error selecting file:", error);
    throw new Error("Failed to select video file");
  }
}

/**
 * Opens a file save dialog to select where to save the compressed video
 * 
 * @param defaultName - Default filename for the save dialog
 * @returns Promise resolving to the selected save path or null if cancelled
 * @throws Error if save location selection fails
 */
export async function selectSaveLocation(defaultName: string): Promise<string | null> {
  try {
    return await invoke<string | null>("save_video_file", { defaultPath: defaultName });
  } catch (error) {
    console.error("Error selecting save location:", error);
    throw new Error("Failed to select save location");
  }
}

/**
 * Retrieves metadata information about a video file
 * 
 * @param filePath - Path to the video file
 * @returns Promise resolving to video metadata
 * @throws Error if metadata retrieval fails
 */
export async function getVideoInfo(filePath: string): Promise<VideoInfo> {
  try {
    return await invoke<VideoInfo>("get_video_info", { inputPath: filePath });
  } catch (error) {
    console.error("Error getting video info:", error);
    throw new Error("Failed to get video info");
  }
}

/**
 * Compresses a video file with the specified settings
 * 
 * @param inputPath - Path to the input video file
 * @param settings - Compression settings to apply
 * @param onProgress - Optional callback for compression progress updates
 * @returns Promise resolving to compression result
 * @throws Error if compression fails
 */
export async function compressVideo(
  inputPath: string, 
  settings: CompressionSettings,
  onProgress?: (progress: number) => void
): Promise<CompressionResult> {
  try {
    // Generate default output filename
    const fileName = inputPath.split(/[\\/]/).pop() || 'video';
    const fileExt = fileName.split('.').pop() || 'mp4';
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const defaultName = `${baseName}_compressed.${fileExt}`;

    // Let user select save location
    const outputPath = await selectSaveLocation(defaultName);
    if (!outputPath) {
      throw new Error("No save location selected");
    }

    console.log('Starting compression with settings:', {
      input: inputPath,
      output: outputPath,
      settings
    });

    // Setup progress listener
    const unlisten = await listen<number>('compression-progress', (event) => {
      console.log('[videoService] Received progress event:', event);
      if (onProgress) {
        // Ensure progress is a number between 0 and 100
        const progress = Math.max(0, Math.min(100, event.payload));
        console.log('[videoService] Calling progress callback with:', progress);
        onProgress(progress);
      }
    });

    try {
      console.log('[videoService] Starting FFmpeg compression...');
      const result = await invoke<CompressionResult>('compress_video', {
        inputPath: inputPath,
        outputPath: outputPath,
        settings: {
          ...settings,
          ...(settings.resolution !== "original" && {
            width: settings.width,
            height: settings.height
          })
        }
      });

      return result;
    } finally {
      unlisten();
    }
  } catch (error) {
    console.error("Compression error:", error);
    throw error;
  }
}

/**
 * Opens a file using the system's default application
 * 
 * @param path - Path to the file to open
 * @throws Error if file opening fails
 */
export async function openFile(path: string): Promise<void> {
  try {
    await invoke("open_file", { path });
  } catch (error) {
    console.error("Error opening file:", error);
    throw new Error("Failed to open file");
  }
}