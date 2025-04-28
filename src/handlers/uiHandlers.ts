/**
 * UI Handlers Module
 */

import { getEl } from '../utils/dom';

export function hideCompressionSettings() {
  getEl(".space-y-6")?.classList.add("hidden");
}

export function showCompressionSettings() {
  getEl(".space-y-6")?.classList.remove("hidden");
  getEl("#video-info")?.classList.remove("hidden");
}

export function resetUploadUI() {
  const progressBar = getEl("#upload-progress-bar");
  const progressText = getEl("#upload-progress-text");
  const uploadProgress = getEl("#upload-progress-container");
  const videoInfo = getEl("#video-info");
  if (progressBar) progressBar.style.width = '0%';
  if (progressText) progressText.textContent = '';
  if (uploadProgress) uploadProgress.classList.add('hidden');
  if (videoInfo) videoInfo.classList.add('hidden');
}

export function updateUploadProgress(percent: number, text: string) {
  const progressBar = getEl("#upload-progress-bar");
  const progressText = getEl("#upload-progress-text");
  if (progressBar) {
    progressBar.style.transition = 'width 0.4s cubic-bezier(0.4,0,0.2,1)';
    progressBar.style.width = `${percent}%`;
  }
  if (progressText) {
    progressText.textContent = text;
  }
}

export function updateFileStatus(filePath: string) {
  const fileStatusEl = getEl("#file-status");
  if (fileStatusEl) {
    fileStatusEl.textContent = `Selected: ${filePath}`;
    fileStatusEl.classList.remove("text-gray-500");
    fileStatusEl.classList.add("text-green-500");
  }
}

export function updateVideoInfo(info: any) {
  const videoNameEl = getEl("#video-name");
  const videoDurationEl = getEl("#video-duration");
  const videoSizeEl = getEl("#video-size");
  const videoResolutionEl = getEl("#video-resolution");
  
  if (videoNameEl) videoNameEl.textContent = info.name;
  if (videoDurationEl) videoDurationEl.textContent = info.duration;
  if (videoSizeEl) videoSizeEl.textContent = info.size;
  if (videoResolutionEl && info.resolution) videoResolutionEl.textContent = info.resolution;
} 