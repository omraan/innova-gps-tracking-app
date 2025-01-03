import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type DateStore = {
	selectedDate: string | null;
	setSelectedDate: (date: string) => void;
	isToday: () => boolean;
	error?: null | {
		message?: string;
		details?: string;
	};
	resetError: () => void;
};

export const useDateStore = create<DateStore>()((set, get) => ({
	selectedDate: moment(new Date()).format("YYYY-MM-DD"),
	setSelectedDate: (selectedDate) => set(() => ({ selectedDate })),
	isToday: () => get().selectedDate === moment(new Date()).format("YYYY-MM-DD"),
	error: null,
	resetError: () => set({ error: null }),
}));
