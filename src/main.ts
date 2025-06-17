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
import { AppState, initialState, updateState } from './state/appState';
import {  
  showCompressionSettings, 
  updateUploadProgress, 
  updateFileStatus, 
  updateVideoInfo 
} from './handlers/uiHandlers';

// Initialize application state
let state: AppState = initialState;

// Initialize DOM elements
document.addEventListener('DOMContentLoaded', () => {
  initializeDOMElements();
  initDragAndDrop();
  setupEventListeners();

  // Set initial selected state for resolution buttons
  const initialSelected = document.querySelector(`.resolution-option[data-resolution="${state.selectedResolution}"]`);
  if (initialSelected) {
    initialSelected.classList.add("selected", "bg-blue-600", "text-white");
    initialSelected.classList.remove("bg-gray-700", "text-gray-300");
  }

  // Bitrate slider value update
  const bitrateSlider = document.getElementById('bitrate') as HTMLInputElement;
  const bitrateValue = document.getElementById('bitrate-value');
  if (bitrateSlider && bitrateValue) {
    bitrateSlider.addEventListener('input', () => {
      bitrateValue.textContent = bitrateSlider.value;
    });
  }
  // Buffer size slider value update
  const bufferSlider = document.getElementById('buffer-size') as HTMLInputElement;
  const bufferValue = document.getElementById('buffer-size-value');
  if (bufferSlider && bufferValue) {
    bufferSlider.addEventListener('input', () => {
      bufferValue.textContent = bufferSlider.value;
    });
  }

  addButtonClickAnimation('#compress-button');
  const bitrate = document.getElementById('bitrate');
  if (bitrate) bitrate.setAttribute('title', 'Higher bitrate = Better quality');
  const buffer = document.getElementById('buffer-size');
  if (buffer) buffer.setAttribute('title', 'Controls video buffering');

  // Event delegation for the x button in video-info
  const videoInfo = getEl('#video-info');
  if (videoInfo) {
    videoInfo.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('button.text-gray-500')) {
        window.location.reload();
      }
    });
  }

  const closeBtn = document.querySelector('#video-info button');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.location.reload();
    });
  }
});

// Event Listeners
function setupEventListeners() {
  const browseButton = getEl("#browse-files");
  const compressButton = getEl("#compress-button");
  const resolutionButtons = document.querySelectorAll(".resolution-option");

  browseButton?.addEventListener("click", handleFileSelect);
  compressButton?.addEventListener("click", (e) => {
    if (state.selectedFilePath) {
      handleCompression(e, state.selectedFilePath, state.selectedResolution);
    }
  });
  resolutionButtons.forEach(button => {
    button.addEventListener("click", handleResolutionClick);
  });
}

// File Handlers
async function handleFileSelect() {
  const progressContainer = getEl("#upload-progress-container");
  const dropArea = getEl("#drop-area");
  try {
    console.log('Starting file selection...');

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
      // User cancelled file selection
      if (progressContainer) progressContainer.classList.add("hidden");
      updateUploadProgress(0, "No file selected");
      const fileStatus = getEl("#file-status");
      if (fileStatus) {
        fileStatus.textContent = "No file selected";
        fileStatus.classList.remove("text-green-500");
        fileStatus.classList.add("text-gray-500");
      }
      return;
    }

    state = updateState(state, { selectedFilePath: result });
    updateFileStatus(result);
    await handleVideoSelection(result);
  } catch (error) {
    console.error('Error in handleFileSelect:', error);
    showError(error instanceof Error ? error.message : 'Failed to select file');
  } finally {
    const dropArea = getEl("#drop-area");
    if (dropArea) {
      dropArea.classList.remove("opacity-50");
    }
  }
}

function animateCSS(element: HTMLElement, animationName: string, callback?: any) {
  element.classList.add('animate__animated', animationName);
  function handleAnimationEnd() {
    element.classList.remove('animate__animated', animationName);
    element.removeEventListener('animationend', handleAnimationEnd);
    if (typeof callback === 'function') callback();
  }
  element.addEventListener('animationend', handleAnimationEnd);
}

// --- Enhance Video Info Card and Preview Animations ---
async function handleVideoSelection(filePath: string) {
  try {
    updateUploadProgress(10, "Getting video info...");
    const info = await getVideoInfo(filePath);
    updateUploadProgress(30, "Updating preview...");
    await updateVideoPreview(filePath);
    updateUploadProgress(50, "Updating video info...");
    const videoStream = info.streams.find((s: any) => s.codec_type === "video");
    const width = videoStream?.width || 0;
    const height = videoStream?.height || 0;
    updateVideoInfo({
      name: filePath.split(/[\\/]/).pop() || filePath,
      duration: formatDuration(info.format.duration || 0),
      size: formatFileSize(info.format.size || 0),
      resolution: `${width}x${height}`
    });
    updateUploadProgress(100, "Ready to compress!");
    showCompressionSettings();
    // Animate video info card
    const videoInfo = getEl('#video-info');
    if (videoInfo) animateCSS(videoInfo, 'animate__fadeInDown', undefined);
    // Animate video preview
    const videoPreview = getEl('#video-preview');
    if (videoPreview) animateCSS(videoPreview, 'animate__fadeIn', undefined);
    // Hide upload progress bar after video info is loaded
    const uploadProgress = getEl('#upload-progress-container');
    if (uploadProgress) uploadProgress.classList.add('hidden');
  } catch (error) {
    console.error('Error in handleVideoSelection:', error);
    showError(error instanceof Error ? error.message : 'Failed to process video');
  }
}

function handleResolutionClick(e: Event) {
  const button = e.currentTarget as HTMLElement;
  const resolution = button.getAttribute("data-resolution");
  
  if (resolution) {
    state = updateState(state, { selectedResolution: resolution });
    
    document.querySelectorAll(".resolution-option").forEach(btn => {
      btn.classList.remove("selected", "bg-blue-600", "text-white");
      btn.classList.add("bg-gray-700", "text-gray-300");
    });
    button.classList.add("selected", "bg-blue-600", "text-white");
    button.classList.remove("bg-gray-700", "text-gray-300");
  }
}

// Drag and Drop
function initDragAndDrop() {
  const dropArea = getEl("#drop-area");
  
  if (!dropArea) return;

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });

  function highlight() {
    if (dropArea) {
      dropArea.classList.add('border-blue-500');
    }
  }

  function unhighlight() {
    if (dropArea) {
      dropArea.classList.remove('border-blue-500');
    }
  }

  dropArea.addEventListener('drop', handleDrop, false);

  async function handleDrop(e: DragEvent) {
    const dt = e.dataTransfer;
    if (dt?.files.length) {
      await handleFileSelect();
    }
  }
}

// --- Button Click Animation ---
function addButtonClickAnimation(selector: any) {
  document.querySelectorAll(selector).forEach(btn => {
    btn.addEventListener('click', () => {
      (btn as HTMLElement).classList.add('scale-95');
      setTimeout(() => (btn as HTMLElement).classList.remove('scale-95'), 120);
    });
  });
}

// --- Modernized Toast with Custom States ---
function showToast(message: string, actionText?: string, actionCallback?: any, type: string = 'info') {
  let toast = document.createElement('div');
  let icon = '<i class="fas fa-info-circle"></i>';
  let color = 'bg-blue-600';
  let aria = 'Info';
  if (type === 'success') { icon = '<i class="fas fa-check-circle"></i>'; color = 'bg-green-600'; aria = 'Success'; }
  if (type === 'error') { icon = '<i class="fas fa-times-circle"></i>'; color = 'bg-red-600'; aria = 'Error'; }
  toast.className = `fixed top-8 left-1/2 transform -translate-x-1/2 z-50 ${color} text-white px-3 py-2 text-sm rounded-xl shadow-xl flex items-center gap-2 border border-white/10 opacity-0 transition-opacity duration-300 animate__animated animate__fadeInDown`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-label', aria);
  toast.innerHTML = `<span class="text-white text-lg">${icon}</span><span class="font-medium">${message}</span>`;
  if (actionText && actionCallback) {
    const btn = document.createElement('button');
    btn.className = 'ml-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-2 py-1 rounded-lg transition text-xs shadow';
    btn.textContent = actionText;
    btn.onclick = () => { actionCallback(); document.body.removeChild(toast); };
    toast.appendChild(btn);
  }
  const closeBtn = document.createElement('button');
  closeBtn.className = 'ml-1 text-white/70 hover:text-white text-base focus:outline-none';
  closeBtn.innerHTML = '<i class="fas fa-times"></i>';
  closeBtn.setAttribute('aria-label', 'Close notification');
  closeBtn.onclick = () => { document.body.removeChild(toast); };
  toast.appendChild(closeBtn);
  document.body.appendChild(toast);
  setTimeout(() => { toast.classList.add('opacity-100'); toast.classList.remove('opacity-0'); }, 10);
  if (type === 'error') animateCSS(toast, 'animate__shakeX');
  setTimeout(() => {
    toast.classList.remove('opacity-100');
    toast.classList.add('opacity-0');
    setTimeout(() => { if (document.body.contains(toast)) document.body.removeChild(toast); }, 300);
  }, 5000);
}
(window as any).showToast = showToast;
