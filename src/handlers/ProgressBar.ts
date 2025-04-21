/**
 * Progress Bar Module
 * 
 * This module provides functionality for managing and displaying progress information
 * during video compression operations. It handles:
 * - Updating progress percentage and status text
 * - Showing/hiding the progress bar
 * - Displaying detailed progress information
 */

import { getEl } from "../utils/dom";

/**
 * Updates the progress bar with new information
 * 
 * @param percent - Progress percentage (0-100)
 * @param text - Status text to display
 * @param details - Optional detailed progress information
 * 
 * @example
 * updateProgress(50, "Compressing video...", "Estimated time remaining: 2:30");
 */
export function updateProgress(percent: number, text: string, details?: string) {
    console.log('[UI] Updating progress:', { percent, text, details });

    // Get elements
    const progressBar = getEl<HTMLElement>("#progress-bar");
    const progressContainer = getEl("#progress-container");
    const progressPercent = getEl<HTMLElement>("#progress-percent");
    const progressStatus = getEl<HTMLElement>("#progress-status");
    const progressDetails = getEl<HTMLElement>("#progress-details");

    // Make sure progress container is visible
    if (progressContainer) {
        progressContainer.classList.remove("hidden");
    }

    // Update progress bar
    if (progressBar) {
        progressBar.style.transition = 'width 0.5s ease-in-out';
        // Force a reflow to ensure transition works
        void progressBar.offsetWidth;
        progressBar.style.width = `${percent}%`;
        console.log('[UI] Set progress bar width to:', `${percent}%`);
    }

    // Update progress text
    if (progressPercent) {
        progressPercent.textContent = `${Math.round(percent)}%`;
    }

    // Update status text
    if (progressStatus) {
        progressStatus.textContent = text;
    }

    // Update details if provided
    if (progressDetails) {
        progressDetails.textContent = details || '';
    }
}

/**
 * Hides the progress bar and clears progress information
 * 
 * @example
 * hideProgress();
 */
export function hideProgress() {
    const progressContainer = getEl("#progress-container");
    if (progressContainer) {
        progressContainer.classList.add("hidden");
    }
}
