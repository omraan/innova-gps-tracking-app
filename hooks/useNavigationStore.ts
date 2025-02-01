import { create } from "zustand";

type NavigationStore = {
	activeNavigateOption: NavigateOptionName;
	setActiveNavigateOption: (activeNavigateOption: NavigateOptionName) => void;
};

export const useNavigationStore = create<NavigationStore>()((set, get) => ({
	activeNavigateOption: "navigate",
	setActiveNavigateOption: (activeNavigateOption) => set(() => ({ activeNavigateOption })),
}));
