import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type DateStore = {
	selectedDate: string | null;
	setSelectedDate: (date: string) => void;
	error?: null | {
		message?: string;
		details?: string;
	};
	resetError: () => void;
};

export const useDateStore = create<DateStore>()(
	persist(
		(set, get) => ({
			selectedDate: null,
			setSelectedDate: (selectedDate) => set(() => ({ selectedDate })),
			error: null,
			resetError: () => set({ error: null }),
		}),
		{
			name: "date-storage",
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
);
