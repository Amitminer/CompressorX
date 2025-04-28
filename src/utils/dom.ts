/**
 * DOM Utilities Module
 *
 * This module provides utility functions for DOM manipulation and element selection.
 */

/**
 * Gets a DOM element and logs a warning if not found
 *
 * @param selector - CSS selector string
 * @param name? - Human-readable name of the element for debugging
 * @returns The selected element or null if not found
 */
export function getEl<T extends HTMLElement = HTMLElement>(
  selector: string,
  name: string = selector
): T | null {
  const el = document.querySelector<T>(selector);
  if (!el) {
    console.warn(`Warning: DOM element "${name}" not found (selector: ${selector})`);
  }
  return el;
}

/**
 * Gets a required DOM element and throws an error if not found
 *
 * @param selector - CSS selector string
 * @returns The selected element
 */
export function getRequiredEl<T extends HTMLElement = HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) {
    throw new Error(`Required DOM element not found: ${selector}`);
  }
  return el;
}

// DOM Elements
export let fileInputEl: HTMLInputElement | null;
export let filePathEl: HTMLElement | null;
export let bitrateInputEl: HTMLInputElement | null;
export let bufferSizeInputEl: HTMLInputElement | null;
export let resolutionSelectEl: HTMLSelectElement | null;
export let compressButtonEl: HTMLButtonElement | null;
export let progressBarEl: HTMLElement | null;
export let progressTextEl: HTMLElement | null;
export let resultEl: HTMLElement | null;
export let videoInfoEl: HTMLElement | null;
export let fileStatusEl: HTMLElement | null;
export let uploadProgressEl: HTMLElement | null;
export let uploadProgressTextEl: HTMLElement | null;
export let uploadProgressBarEl: HTMLElement | null;
/**
 * Initializes all DOM elements used in the application
 */
export function initializeDOMElements(): void {
  bitrateInputEl = getEl("#bitrate", "Bitrate Input");
  bufferSizeInputEl = getEl("#buffer-size", "Buffer Size Input");
  // resolutionSelectEl = null; // Initialize as null for now
  compressButtonEl = getEl("#compress-button", "Compress Button");
  progressBarEl = getEl("#progress-bar", "Progress Bar");
  // progressTextEl = null; // Initialize as null for now
  resultEl = getEl("#result", "Result");
  videoInfoEl = getEl("#video-info", "Video Info");
  fileStatusEl = getEl("#file-status", "File Status");
  
  uploadProgressTextEl = getEl("#upload-progress-text", "Upload Progress Text");
  uploadProgressBarEl = getEl("#upload-progress-bar", "Upload Progress Bar");
  uploadProgressEl = null;
}   
