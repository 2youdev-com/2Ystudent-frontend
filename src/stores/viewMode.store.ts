import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ViewMode = 'admin' | 'student';

interface ViewModeState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  isStudentView: boolean;
}

export const useViewModeStore = create<ViewModeState>()(
  persist(
    (set, get) => ({
      viewMode: 'admin',
      isStudentView: false,

      setViewMode: (mode: ViewMode) => {
        set({ viewMode: mode, isStudentView: mode === 'student' });
      },

      toggleViewMode: () => {
        const current = get().viewMode;
        const newMode = current === 'admin' ? 'student' : 'admin';
        set({ viewMode: newMode, isStudentView: newMode === 'student' });
      },
    }),
    {
      name: 'view-mode-storage',
    }
  )
);
