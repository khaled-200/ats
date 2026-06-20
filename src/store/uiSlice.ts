import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  showEditor: boolean;
  showPreview: boolean;
  showScorer: boolean;
  showSettings: boolean;
}

const initialState: UiState = {
  showEditor: true,
  showPreview: true,
  showScorer: true,
  showSettings: false // Design settings are hidden in side toolbar by default
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleEditor: (state) => {
      state.showEditor = !state.showEditor;
    },
    togglePreview: (state) => {
      state.showPreview = !state.showPreview;
    },
    toggleScorer: (state) => {
      state.showScorer = !state.showScorer;
    },
    toggleSettings: (state) => {
      state.showSettings = !state.showSettings;
    },
    setViews: (state, action: PayloadAction<Partial<UiState>>) => {
      return { ...state, ...action.payload };
    }
  }
});

export const { toggleEditor, togglePreview, toggleScorer, toggleSettings, setViews } = uiSlice.actions;
export default uiSlice.reducer;
