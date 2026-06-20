import { configureStore } from "@reduxjs/toolkit";
import resumeReducer, { Resume, setResumesState } from "./resumeSlice";
import uiReducer from "./uiSlice";
import paymentReducer, { setUnlocked } from "./paymentSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

export const store = configureStore({
  reducer: {
    resume: resumeReducer,
    ui: uiReducer,
    payment: paymentReducer,
  },
});

// Load state from localStorage on client side safely
export const initializeStoreFromLocalStorage = () => {
  if (typeof window === "undefined") return;
  try {
    const resumesData = localStorage.getItem("ats_resumes");
    const activeId = localStorage.getItem("ats_active_resume_id");
    const unlocked = sessionStorage.getItem("ats_download_unlocked") === "true";

    if (resumesData && activeId) {
      const resumes = JSON.parse(resumesData) as Resume[];
      store.dispatch(setResumesState({ resumes, activeResumeId: activeId }));
    }
    
    if (unlocked) {
      store.dispatch(setUnlocked(true));
    }
  } catch (e) {
    console.error("Error loading persisted store", e);
  }
};

// Auto-subscribe to store changes and save to local storage
if (typeof window !== "undefined") {
  store.subscribe(() => {
    try {
      const state = store.getState();
      if (state.resume.resumes.length > 0) {
        localStorage.setItem("ats_resumes", JSON.stringify(state.resume.resumes));
        localStorage.setItem("ats_active_resume_id", state.resume.activeResumeId);
      }
      
      if (state.payment.isUnlocked) {
        sessionStorage.setItem("ats_download_unlocked", "true");
      } else {
        sessionStorage.removeItem("ats_download_unlocked");
      }
    } catch (e) {
      console.error("Error persisting state", e);
    }
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
