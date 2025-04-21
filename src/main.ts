/**
 * CompressorX Frontend
 * 
 * This is the main entry point for the CompressorX frontend application.
 * It handles file selection, video processing, and user interface interactions.
 */

import './styles/index.css';
import { selectVideoFile, getVideoInfo } from './services/videoService';
import { formatDuration, formatFileSize } from './utils/formatters';
import { updateVideoPreview } from './handlers/VideoPreview';
import { handleCompression, showError } from './handlers/CompressionHandler';
import { getEl, initializeDOMElements } from './utils/dom';
// State
let selectedFilePath: string | null = null;
let selectedResolution = "original";

// Helpers
function hideCompressionSettings() {
  getEl(".space-y-6")?.classList.add("hidden");
}

function showCompressionSettings() {
  getEl(".space-y-6")?.classList.remove("hidden");
  getEl("#video-info")?.classList.remove("hidden");
}

// File Handlers
async function handleFileSelect() {
  try {
    console.log('Starting file selection...');
    const progressContainer = getEl("#upload-progress-container");
    const dropArea = getEl("#drop-area");
    
    if (progressContainer) {
      progressContainer.classList.remove("hidden");
    }
    updateUploadProgress(0, "Selecting file...");
    
    // Show loading state on drop area
    if (dropArea) {
      dropArea.classList.add("opacity-50");
    }

    const result = await selectVideoFile();
    console.log('selectVideoFile result:', result);
    
    if (!result) {
      throw new Error('No file selected');
    }

    selectedFilePath = result;
    console.log('Selected file path:', selectedFilePath);
    updateUploadProgress(30, "Processing file...");
    
    // Update file status first
    updateFileStatus(result);
    
    // Get video info before preview to ensure file is valid
    updateUploadProgress(50, "Getting video info...");
    const info = await getVideoInfo(result);
    console.log('Video info:', info);
    
    if (!info || !info.format) {
      throw new Error('Invalid video file or could not read video information');
    }
    
    // Update video info in UI
    updateUploadProgress(70, "Updating video info...");
    updateVideoInfo(info);
    
    // Create video preview
    updateUploadProgress(90, "Creating preview...");
    await updateVideoPreview(result);
    
    // Show compression settings
    showCompressionSettings();
    
    updateUploadProgress(100, "Complete!");
    setTimeout(() => {
      if (progressContainer) {
        progressContainer.classList.add("hidden");
      }
      if (dropArea) {
        dropArea.classList.remove("opacity-50");
      }
    }, 1000);
    
  } catch (error: any) {
    console.error("Error in handleFileSelect:", error);
    showError(`Failed to process video: ${error?.message || 'Unknown error'}`);
    const progressContainer = getEl("#upload-progress-container");
    const dropArea = getEl("#drop-area");
    if (progressContainer) {
      progressContainer.classList.add("hidden");
    }
    if (dropArea) {
      dropArea.classList.remove("opacity-50");
    }
  }
}

function updateFileStatus(filePath: string) {
  console.log('Updating file status for:', filePath);
  
  // Get or create file path element
  let filePathEl = getEl("#file-path");
  if (!filePathEl) {
    console.log('Creating file path element');
    filePathEl = document.createElement('div');
    filePathEl.id = 'file-path';
    filePathEl.className = 'hidden'; // Keep it hidden as it's just for tracking
    document.body.appendChild(filePathEl);
  }
  filePathEl.textContent = filePath;

  // Get or create file status element
  let fileStatusEl = getEl("#file-status");
  if (!fileStatusEl) {
    console.log('Creating file status element');
    const dropArea = getEl("#drop-area");
    if (dropArea) {
      fileStatusEl = document.createElement('div');
      fileStatusEl.id = 'file-status';
      fileStatusEl.className = 'mt-2 text-sm font-medium';
      dropArea.appendChild(fileStatusEl);
    }
  }

  if (fileStatusEl) {
    const fileName = filePath.split(/[\\/]/).pop() || filePath;
    fileStatusEl.textContent = `Selected: ${fileName}`;
    fileStatusEl.className = 'mt-2 text-sm font-medium text-blue-500';
  }
}

function updateVideoInfo(info: any) {
  const videoStream = info.streams.find((s: any) => s.codec_type === "video");
  const videoInfoEl = getEl("#video-info");
  if (!videoStream || !videoInfoEl) return;

  const { width, height } = videoStream;
  const { duration, size } = info.format;

  videoInfoEl.innerHTML = `
    <div class="text-sm">
      <p><strong>Resolution:</strong> ${width}x${height}</p>
      <p><strong>Duration:</strong> ${formatDuration(duration)}</p>
      <p><strong>Size:</strong> ${formatFileSize(size)}</p>
    </div>
  `;
}

function handleResolutionClick(e: Event) {
  const button = e.target as HTMLButtonElement;
  const resolution = button.dataset.resolution;
  if (!resolution) return;

  selectedResolution = resolution;
  document.querySelectorAll('#resolution-buttons button').forEach(btn => {
    btn.classList.toggle('bg-blue-600', btn === button);
    btn.classList.toggle('text-white', btn === button);
    btn.classList.toggle('bg-gray-800', btn !== button);
    btn.classList.toggle('hover:bg-gray-700', btn !== button);
    btn.classList.toggle('text-gray-300', btn !== button);
  });
}

function updateUploadProgress(percent: number, text: string) {
  const progressBar = getEl<HTMLElement>("#upload-progress-bar");
  const progressText = getEl<HTMLElement>("#upload-progress-text");
  
  if (progressBar) {
    progressBar.style.width = `${percent}%`;
  }
  if (progressText) {
    progressText.textContent = text;
  }
}

// Drag & Drop
function initDragAndDrop() {
  const dropZone = getEl("#drop-area");
  if (!dropZone) return;

  dropZone.addEventListener("dragover", e => {
    e.preventDefault();
    dropZone.classList.add("border-blue-500");
  });

  dropZone.addEventListener("dragleave", e => {
    e.preventDefault();
    dropZone.classList.remove("border-blue-500");
  });

  dropZone.addEventListener("drop", async e => {
    e.preventDefault();
    dropZone.classList.remove("border-blue-500");

    const file = (e as DragEvent).dataTransfer?.files?.[0];
    if (file?.type.startsWith("video/")) {
      try {
        getEl("#upload-progress-container")?.classList.remove("hidden");
        updateUploadProgress(0, "Processing dropped file...");
        
        const result = await selectVideoFile();
        if (result) {
          console.log('File dropped and selected:', result);
          selectedFilePath = result;
          updateFileStatus(result);
          
          updateUploadProgress(50, "Creating preview...");
          await updateVideoPreview(result);
          
          updateUploadProgress(70, "Getting video info...");
          const info = await getVideoInfo(result);
          
          updateUploadProgress(90, "Updating interface...");
          updateVideoInfo(info);
          showCompressionSettings();
          
          updateUploadProgress(100, "Complete!");
          setTimeout(() => {
            getEl("#upload-progress-container")?.classList.add("hidden");
          }, 1000);
        }
      } catch (err: any) {
        console.error("Drop error:", err);
        showError("Failed to process dropped video file: " + (err?.message || 'Unknown error'));
        getEl("#upload-progress-container")?.classList.add("hidden");
      }
    } else {
      showError("Please drop a video file");
    }
  });
}

// Init
window.addEventListener("DOMContentLoaded", () => {
  initializeDOMElements();

  getEl("#browse-files")?.addEventListener("click", handleFileSelect);
  getEl("#compress-form")?.addEventListener("submit", (e) => handleCompression(e, selectedFilePath, selectedResolution));

  document.querySelectorAll('#resolution-buttons button')
    .forEach(btn => btn.addEventListener("click", handleResolutionClick));

  initDragAndDrop();
  hideCompressionSettings();

  // Create initial UI structure if it doesn't exist
  const mainContainer = getEl("#app");
  if (mainContainer) {
    // Create drop area if it doesn't exist
    let dropArea = getEl("#drop-area");
    if (!dropArea) {
      console.log('Creating drop area');
      dropArea = document.createElement('div');
      dropArea.id = 'drop-area';
      dropArea.className = 'border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors';
      dropArea.innerHTML = `
        <div class="space-y-4">
          <div class="flex justify-center">
            <i class="fas fa-cloud-upload-alt text-4xl text-gray-500"></i>
          </div>
          <div class="text-gray-300">
            <p class="text-lg font-medium">Drop your video here</p>
            <p class="text-sm text-gray-500">or</p>
          </div>
          <button id="browse-files" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Browse Files
          </button>
          <div id="file-status" class="mt-2 text-sm font-medium text-gray-500"></div>
        </div>
      `;
      mainContainer.appendChild(dropArea);
    }

    // Create video preview area if it doesn't exist
    let videoPreview = getEl("#video-preview");
    if (!videoPreview) {
      console.log('Creating video preview area');
      videoPreview = document.createElement('div');
      videoPreview.id = 'video-preview';
      videoPreview.className = 'mt-6 hidden';
      mainContainer.appendChild(videoPreview);
    }

    // Create video info area if it doesn't exist
    let videoInfo = getEl("#video-info");
    if (!videoInfo) {
      console.log('Creating video info area');
      videoInfo = document.createElement('div');
      videoInfo.id = 'video-info';
      videoInfo.className = 'mt-4 p-4 bg-gray-800 rounded-lg hidden';
      mainContainer.appendChild(videoInfo);
    }

    // Add upload progress container if it doesn't exist
    let progressContainer = getEl("#upload-progress-container");
    if (!progressContainer) {
      console.log('Creating progress container');
      progressContainer = document.createElement('div');
      progressContainer.id = 'upload-progress-container';
      progressContainer.className = 'hidden mt-4';
      progressContainer.innerHTML = `
        <div class="space-y-3">
          <div class="relative pt-1">
            <div class="flex mb-2 items-center justify-between">
              <div class="flex items-center gap-2">
                <div id="progress-status" class="text-sm font-medium text-gray-300">Starting compression...</div>
                <div id="progress-percent" class="text-sm font-medium text-blue-500">0%</div>
              </div>
            </div>
            <div class="overflow-hidden h-2 text-xs flex rounded bg-gray-700">
              <div id="progress-bar" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-300" style="width: 0%"></div>
            </div>
            <div id="progress-details" class="mt-1 text-xs text-gray-500"></div>
          </div>
        </div>
      `;
      mainContainer.appendChild(progressContainer);
    }

    // Create compression form if it doesn't exist
    let compressionForm = getEl("#compress-form");
    if (!compressionForm) {
      console.log('Creating compression form');
      compressionForm = document.createElement('form');
      compressionForm.id = 'compress-form';
      compressionForm.className = 'space-y-6 hidden';
      compressionForm.innerHTML = `
        <div class="space-y-4">
          <div class="space-y-2">
            <label for="bitrate" class="block text-sm font-medium text-gray-300">Bitrate (kbps)</label>
            <input type="number" id="bitrate" value="1000" min="100" max="10000"
              class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div class="space-y-2">
            <label for="buffer-size" class="block text-sm font-medium text-gray-300">Buffer Size (kb)</label>
            <input type="number" id="buffer-size" value="2000" min="100" max="20000"
              class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">Resolution</label>
            <div id="resolution-buttons" class="flex space-x-2">
              <button type="button" data-resolution="original" class="px-3 py-1 rounded-lg bg-blue-600 text-white">Original</button>
              <button type="button" data-resolution="720p" class="px-3 py-1 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700">720p</button>
              <button type="button" data-resolution="480p" class="px-3 py-1 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700">480p</button>
              <button type="button" data-resolution="360p" class="px-3 py-1 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700">360p</button>
            </div>
          </div>
          <button type="submit" id="compress-button"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2">
            <i class="fas fa-compress"></i>
            Compress Video
          </button>
        </div>

        <div id="compression-status" class="mt-6">
          <div id="progress-container" class="p-4 bg-gray-800 rounded-lg hidden">
            <div class="space-y-3">
              <div class="relative pt-1">
                <div class="flex mb-2 items-center justify-between">
                  <div id="progress-text" class="text-sm font-medium text-gray-300">Starting compression...</div>
                </div>
                <div class="overflow-hidden h-2 text-xs flex rounded bg-gray-700">
                  <div id="progress-bar" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600" style="width: 0%; transition: width 0.5s ease-in-out"></div>
                </div>
              </div>
            </div>
          </div>
          <div id="result" class="mt-4"></div>
        </div>
      `;
      mainContainer.appendChild(compressionForm);

      // Add event listeners for resolution buttons
      document.querySelectorAll('#resolution-buttons button').forEach(btn => {
        btn.addEventListener('click', handleResolutionClick);
      });

      // Create initial compression status container
      const compressionStatus = document.createElement('div');
      compressionStatus.id = 'compression-status';
      compressionStatus.className = 'mt-6';
      mainContainer.appendChild(compressionStatus);

      // Create result container
      const resultContainer = document.createElement('div');
      resultContainer.id = 'result';
      resultContainer.className = 'mt-4';
      compressionStatus.appendChild(resultContainer);
      
      // Add compression status to form
      getEl("#compress-form")?.appendChild(compressionStatus);
    }

    // Add form submit handler
    compressionForm.addEventListener('submit', (e) => handleCompression(e, selectedFilePath, selectedResolution));

    // After creating new elements, reinitialize DOM references
    initializeDOMElements();
  }
});
