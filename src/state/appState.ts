/**
 * Application State Management
 */

export interface AppState {
  selectedFilePath: string | null;
  selectedResolution: string;
  isProcessing: boolean;
}

export const initialState: AppState = {
  selectedFilePath: null,
  selectedResolution: "original",
  isProcessing: false
};

export function updateState(state: AppState, updates: Partial<AppState>): AppState {
  return { ...state, ...updates };
} 