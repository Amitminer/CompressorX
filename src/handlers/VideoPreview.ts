// VideoPreview.ts

import { convertFileSrc } from '@tauri-apps/api/core';
import { getEl } from '../utils/dom';

export async function updateVideoPreview(filePath: string) {
  try {
    console.log('Starting video preview update for:', filePath);
    const previewEl = getEl("#video-preview");
    if (!previewEl) {
      throw new Error('Video preview element not found');
    }

    // Create video wrapper
    const videoWrapper = document.createElement("div");
    videoWrapper.className = "relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden";

    const video = document.createElement("video");
    video.className = "w-full h-full object-contain";
    video.style.backgroundColor = "#1a1a1a";
    
    // Add loading indicator
    const loadingEl = document.createElement("div");
    loadingEl.className = "absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75";
    loadingEl.innerHTML = `
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    `;
    videoWrapper.appendChild(loadingEl);

    return new Promise((resolve, reject) => {
      let timeoutId: number;

      const cleanup = () => {
        window.clearTimeout(timeoutId);
        video.removeEventListener('error', handleError);
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };

      const handleError = (e: Event) => {
        cleanup();
        console.error('Video error:', {
          error: video.error,
          event: e,
          networkState: video.networkState,
          readyState: video.readyState,
          src: video.src
        });
        loadingEl.remove();
        reject(new Error(`Failed to load video: ${video.error?.message || 'Unknown error'}`));
      };

      const handleLoadedData = () => {
        cleanup();
        console.log('Video data loaded successfully', {
          duration: video.duration,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          readyState: video.readyState,
          src: video.src
        });
        loadingEl.remove();
        resolve(video);
      };

      const handleLoadedMetadata = () => {
        console.log('Video metadata loaded:', {
          duration: video.duration,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          src: video.src
        });
        // Set initial time to first frame
        if (video.duration > 0) {
          video.currentTime = 0.1;
        }
      };

      // Add timeout to detect if video loading takes too long
      timeoutId = window.setTimeout(() => {
        cleanup();
        reject(new Error('Video loading timed out'));
      }, 30000);

      // Add all event listeners
      video.addEventListener('error', handleError);
      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);

      // Set video attributes
      video.controls = true;
      video.muted = true;
      video.preload = "auto";
      video.playsInline = true;
      video.autoplay = false;

      // Convert the file path using Tauri's protocol
      try {
        const assetUrl = convertFileSrc(filePath);
        console.log('Setting video source:', {
          originalPath: filePath,
          assetUrl: assetUrl
        });

        // Set the source directly
        video.src = assetUrl;
      } catch (error) {
        console.error('Error converting file path:', error);
        reject(error);
        return;
      }

      // Add to DOM
      videoWrapper.appendChild(video);
      previewEl.innerHTML = '';
      previewEl.appendChild(videoWrapper);
      previewEl.classList.remove("hidden");

      // Try to load the video
      video.load();
    });
  } catch (error: any) {
    console.error('Error in updateVideoPreview:', error);
    throw error;
  }
}
