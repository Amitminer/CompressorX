/**
 * Compression Handler Module
 * 
 * This module handles the video compression process, including:
 * - Managing compression settings and parameters
 * - Handling compression progress and results
 * - Displaying compression results and errors
 * - Providing file opening functionality
 */

import { CompressionResult, CompressionSettings } from '../types';
import { compressVideo, openFile } from '../services/videoService';
import { formatDuration, formatFileSize } from '../utils/formatters';
import { getEl } from '../utils/dom';
import { hideProgress, updateProgress } from './ProgressBar';

function hideProgressContainer() {
  const progressContainer = document.getElementById('progress-container');
  if (progressContainer) progressContainer.classList.add('hidden');
}

/**
 * Displays the compression result in the UI
 * 
 * @param result - The compression result containing success status, file sizes, and output path
 * 
 * @example
 * showResult({
 *   success: true,
 *   output_path: "C:/videos/output.mp4",
 *   original_size: 1000000,
 *   compressed_size: 500000,
 *   compression_ratio: 50
 * });
 */
export function showResult(result: CompressionResult) {
  console.log('Showing compression result:', result);
  
  // Hide progress first
  hideProgress();
  hideProgressContainer();

  // Show toast if successful
  if (result.success && typeof window !== 'undefined' && typeof (window as any).showToast === 'function') {
    (window as any).showToast(
      'Compression complete! 🎉',
      'View Result',
      () => {
        const resultEl = document.getElementById('result');
        if (resultEl) resultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    );
  }

  const resultEl = getEl("#result");
  if (!resultEl) return;

  if (result.success) {
    const sizeDiff = result.original_size - result.compressed_size;
    const isReduced = sizeDiff > 0;
    const percentReduced = (sizeDiff / result.original_size) * 100;
    const formattedSizeDiff = formatFileSize(Math.abs(sizeDiff));

    resultEl.innerHTML = `
      <div class="bg-gray-800 rounded-xl p-6 mt-4 space-y-6">
        <div class="flex items-center gap-3">
          <div class="bg-green-500/20 rounded-full p-2">
            <i class="fas fa-check text-green-500 text-xl"></i>
          </div>
          <span class="text-xl font-medium text-green-500">Processing Complete!</span>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-900/50 rounded-lg p-4">
            <div class="text-sm text-gray-400 mb-1">Original Size</div>
            <div class="text-lg font-medium text-white">${formatFileSize(result.original_size)}</div>
          </div>
          <div class="bg-gray-900/50 rounded-lg p-4">
            <div class="text-sm text-gray-400 mb-1">Result Size</div>
            <div class="text-lg font-medium text-white">${formatFileSize(result.compressed_size)}</div>
          </div>
        </div>

        <div class="bg-${isReduced ? 'yellow' : 'blue'}-500/10 rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-${isReduced ? 'yellow' : 'blue'}-400">Size ${isReduced ? 'Reduced' : 'Increased'} By</span>
            <span class="text-sm font-medium text-${isReduced ? 'yellow' : 'blue'}-400">${percentReduced.toFixed(1)}%</span>
          </div>
          <div class="w-full bg-gray-700 rounded-full h-4">
            <div class="bg-blue-500 h-4 rounded-full transition-all duration-500" style="width: ${Math.max(0, percentReduced)}%"></div>
          </div>
          <div class="mt-2 text-sm text-gray-400">
            ${isReduced ? 'Reduced' : 'Increased'} by ${formattedSizeDiff}
            ${isReduced ? ' (This may happen with certain video codecs or settings)' : ''}
          </div>
        </div>

        <div class="flex gap-3">
          <button id="open-file-btn" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <i class="fas fa-external-link-alt"></i>
            Open File
          </button>
          <button id="open-location-btn" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <i class="fas fa-folder-open"></i>
            Show in Folder
          </button>
        </div>

        <div class="text-xs text-gray-500">
          <i class="fas fa-info-circle mr-1"></i>
          Output saved to: ${result.output_path}
        </div>
      </div>
    `;

    // Add event listeners
    getEl("#open-file-btn")?.addEventListener("click", () => {
      console.log('Opening file:', result.output_path);
      openFile(result.output_path).catch(console.error);
    });

    getEl("#open-location-btn")?.addEventListener("click", () => {
      console.log('Opening folder:', result.output_path);
      // Extract the directory path
      const dirPath = result.output_path.substring(0, result.output_path.lastIndexOf('\\'));
      openFile(dirPath).catch(console.error);
    });
  } else {
    resultEl.innerHTML = `
      <div class="bg-gray-800 rounded-xl p-6 mt-4">
        <div class="flex items-center gap-3">
          <div class="bg-red-500/20 rounded-full p-2">
            <i class="fas fa-times text-red-500 text-xl"></i>
          </div>
          <span class="text-xl font-medium text-red-500">Compression Failed</span>
        </div>
        <div class="mt-4 text-gray-300">
          <p class="text-sm">${result.error_message || "An unknown error occurred during compression."}</p>
        </div>
        <button onclick="window.location.reload()" class="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
          <i class="fas fa-redo"></i>
          Try Again
        </button>
      </div>
    `;
  }
}

/**
 * Displays an error message in the UI
 * 
 * @param message - The error message to display
 * 
 * @example
 * showError("Failed to compress video: File not found");
 */
export function showError(message: string) {
  hideProgressContainer();
  const resultEl = getEl("#result");
  if (resultEl) {
    resultEl.innerHTML = `<div class="text-red-600">${message}</div>`;
  }
}

/**
 * Handles the video compression process
 * 
 * @param e - The form submission event
 * @param selectedFilePath - Path to the selected video file
 * @param selectedResolution - Target resolution for compression
 * 
 * @example
 * handleCompression(event, "C:/videos/input.mp4", "720p");
 */
export async function handleCompression(e: Event, selectedFilePath: string | null, selectedResolution: string) {
  e.preventDefault();
  console.log('[UI] Compression started...');

  try {
    if (!selectedFilePath) {
      showError("Please select a video file first");
      return;
    }

    // Hide upload progress bar when compression starts
    const uploadProgress = getEl('#upload-progress-container');
    if (uploadProgress) uploadProgress.classList.add('hidden');

    // Get all required elements
    const bitrateInput = getEl<HTMLInputElement>("#bitrate");
    const bufferSizeInput = getEl<HTMLInputElement>("#buffer-size");
    const videoInfoEl = getEl("#video-info");
    const compressButton = getEl<HTMLButtonElement>("#compress-button");
    
    if (!bitrateInput || !bufferSizeInput) {
      showError("Compression settings are missing");
      return;
    }

    // Clear previous results
    const resultEl = getEl("#result");
    if (resultEl) {
      resultEl.innerHTML = '';
    }

    // Show progress container and reset progress
    const progressContainer = getEl("#progress-container");
    if (progressContainer) {
      progressContainer.style.display = 'block';
      progressContainer.classList.remove("hidden");
      console.log('[UI] Progress container shown');
    }

    // Reset and show progress
    updateProgress(0, "Starting compression...");

    // Disable compress button
    if (compressButton) {
      compressButton.disabled = true;
      compressButton.classList.add('opacity-50', 'cursor-not-allowed');
    }

    try {
      // Calculate dimensions and get video info
      let [originalWidth, originalHeight] = [1920, 1080];
      let originalBitrate = 1000; // default 1000 kbps
      if (videoInfoEl) {
        const dimText = videoInfoEl.querySelector("p:first-child")?.textContent;
        const match = dimText?.match(/(\d+)x(\d+)/);
        if (match) {
          originalWidth = parseInt(match[1]);
          originalHeight = parseInt(match[2]);
          
          // Calculate a reasonable default bitrate based on resolution
          // Using a rough estimate of 0.1 bits per pixel
          originalBitrate = Math.round((originalWidth * originalHeight * 30 * 0.1) / 1000);
          
          // Update bitrate input with calculated value if it's using the default
          if (bitrateInput && bitrateInput.value === "1000") {
            bitrateInput.value = originalBitrate.toString();
          }
        }
      }

      // Calculate new dimensions based on selected resolution
      let width = originalWidth, height = originalHeight;
      let targetBitrate = parseInt(bitrateInput.value);

      switch (selectedResolution) {
        case "720p":
          if (originalHeight > 720) {
            height = 720;
            width = Math.round((720 * originalWidth) / originalHeight);
            targetBitrate = Math.min(targetBitrate, Math.round((720 * 1280 * 30 * 0.1) / 1000));
          }
          break;
        case "480p":
          if (originalHeight > 480) {
            height = 480;
            width = Math.round((480 * originalWidth) / originalHeight);
            targetBitrate = Math.min(targetBitrate, Math.round((480 * 854 * 30 * 0.1) / 1000));
          }
          break;
        case "360p":
          if (originalHeight > 360) {
            height = 360;
            width = Math.round((360 * originalWidth) / originalHeight);
            targetBitrate = Math.min(targetBitrate, Math.round((360 * 640 * 30 * 0.1) / 1000));
          }
          break;
      }

      // Update bitrate if it was adjusted
      if (bitrateInput && targetBitrate !== parseInt(bitrateInput.value)) {
        bitrateInput.value = targetBitrate.toString();
      }

      const settings: CompressionSettings = {
        bitrate: targetBitrate,
        buffer_size: parseInt(bufferSizeInput.value),
        resolution: selectedResolution,
        width,
        height
      };

      // Start compression with progress callback
      console.log('[UI] Starting compression with settings:', settings);
      
      // Initialize progress at 0 and ensure UI is ready
      updateProgress(0, "Starting compression...");

      // Setup simulated progress
      let simulatedProgress = 0;
      const startTime = Date.now();
      const progressInterval = setInterval(() => {
        if (simulatedProgress < 95) {
          simulatedProgress++;
          const elapsedSeconds = (Date.now() - startTime) / 1000;
          const estimatedTotalSeconds = (elapsedSeconds / simulatedProgress) * 100;
          const remainingSeconds = Math.max(0, estimatedTotalSeconds - elapsedSeconds);
          const details = `Estimated time remaining: ${formatDuration(remainingSeconds)}`;
          updateProgress(simulatedProgress, "Compressing video...", details);
        } else if (simulatedProgress === 95) {
          updateProgress(95, "Final processing - this may take a few minutes...", "Please wait while we finalize your video");
          simulatedProgress++;
        }
      }, 100);

      try {
        const result = await compressVideo(selectedFilePath, settings, (progress) => {
          // Clear simulation if we get real progress
          clearInterval(progressInterval);
          console.log('[UI] Progress callback received:', progress);
          // Ensure progress is between 0 and 99 during compression
          const normalizedProgress = Math.min(99, Math.max(0, progress));
          const elapsedSeconds = (Date.now() - startTime) / 1000;
          const estimatedTotalSeconds = (elapsedSeconds / normalizedProgress) * 100;
          const remainingSeconds = Math.max(0, estimatedTotalSeconds - elapsedSeconds);
          
          // Show different message for final processing stage
          if (normalizedProgress >= 95) {
            updateProgress(normalizedProgress, "Final processing - this may take a few minutes...", "Please wait while we finalize your video");
          } else {
            const details = `Estimated time remaining: ${formatDuration(remainingSeconds)}`;
            updateProgress(normalizedProgress, "Compressing video...", details);
          }
        });

        // Cleanup and show completion
        clearInterval(progressInterval);
        console.log('[UI] Compression result:', result);
        
        // Hide upload progress bar after compression
        if (uploadProgress) uploadProgress.classList.add('hidden');
        
        // Show result immediately
        showResult(result);
        
        // Hide the progress bar after showing the result
        hideProgress();
        
        // Re-enable compress button
        if (compressButton) {
          compressButton.disabled = false;
          compressButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
      } catch (error) {
        // Cleanup on error
        clearInterval(progressInterval);
        console.error('Compression error:', error);
        hideProgress();
        showError(`Failed to compress video: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Hide upload progress bar on error
        if (uploadProgress) uploadProgress.classList.add('hidden');
        if (compressButton) {
          compressButton.disabled = false;
          compressButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
      }
    } catch (error: any) {
      console.error('Compression error:', error);
      showError(`Failed to compress video: ${error?.message || 'Unknown error'}`);
      if (compressButton) {
        compressButton.disabled = false;
        compressButton.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    }
  } catch (error: any) {
    console.error('Error in handleCompression:', error);
    showError(`Compression failed: ${error?.message || 'Unknown error'}`);
  }
}