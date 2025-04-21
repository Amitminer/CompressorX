/**
 * DOM Utilities Module
 * 
 * This module provides utility functions for DOM manipulation and element selection.
 */

/**
 * Gets a DOM element by selector with type safety
 * 
 * @param selector - CSS selector string
 * @returns The selected element or null if not found
 */
export function getEl<T extends HTMLElement = HTMLElement>(selector: string): T | null {
  return document.querySelector(selector);
} 

// DOM Elements
/** File input element for video selection */
export let fileInputEl: HTMLInputElement | null;
/** Element displaying the selected file path */
export let filePathEl: HTMLElement | null;
/** Input element for bitrate setting */
export let bitrateInputEl: HTMLInputElement | null;
/** Input element for buffer size setting */
export let bufferSizeInputEl: HTMLInputElement | null;
/** Select element for resolution setting */
export let resolutionSelectEl: HTMLSelectElement | null;
/** Button element for starting compression */
export let compressButtonEl: HTMLButtonElement | null;
/** Progress bar element */
export let progressBarEl: HTMLElement | null;
/** Element displaying progress text */
export let progressTextEl: HTMLElement | null;
/** Element displaying compression results */
export let resultEl: HTMLElement | null;
/** Element displaying video information */
export let videoInfoEl: HTMLElement | null;
/** Element displaying file status */
export let fileStatusEl: HTMLElement | null;
/** Container element for upload progress */
export let uploadProgressEl: HTMLElement | null;

/**
 * Initializes all DOM elements used in the application
 * 
 * This function should be called after the DOM is loaded to ensure
 * all elements are properly initialized.
 */
export function initializeDOMElements() {
  fileInputEl = getEl("#file-input");
  filePathEl = getEl("#file-path");
  bitrateInputEl = getEl("#bitrate");
  bufferSizeInputEl = getEl("#buffer-size");
  resolutionSelectEl = getEl("#resolution-select");
  compressButtonEl = getEl("#compress-button");
  progressBarEl = getEl("#progress-bar");
  progressTextEl = getEl("#progress-text");
  resultEl = getEl("#result");
  videoInfoEl = getEl("#video-info");
  fileStatusEl = getEl("#file-status");
  uploadProgressEl = getEl("#upload-progress-container");
}
