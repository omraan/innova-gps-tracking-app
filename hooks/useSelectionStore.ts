import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SelectionStore = {
	selectedVehicle: { name: string; value: Vehicle } | null;
	setSelectedVehicle: (vehicle: { name: string; value: Vehicle } | null) => void;
	selectedRoute: { name: string; value: Route } | null;
	setSelectedRoute: (route: { name: string; value: Route } | null) => void;
	selectedRouteStop: { name: string; value: RouteStop } | null;
	setSelectedRouteStop: (routeStop: { name: string; value: RouteStop } | null) => void;
	selectedDate: string | null;
	setSelectedDate: (date: string) => void;
	isToday: () => boolean;
	error?: null | {
		message?: string;
		details?: string;
	};
	resetError: () => void;
};

export const useSelectionStore = create<SelectionStore>()(
	// persist(
	(set, get) => ({
		selectedVehicle: null,
		setSelectedVehicle: (selectedVehicle) => set(() => ({ selectedVehicle })),
		selectedRoute: null,
		setSelectedRoute: (selectedRoute) => set(() => ({ selectedRoute })),
		selectedRouteStop: null,
		setSelectedRouteStop: (selectedRouteStop) => set(() => ({ selectedRouteStop })),
		selectedDate: moment(new Date()).format("YYYY-MM-DD"),
		setSelectedDate: (selectedDate) => set(() => ({ selectedDate })),
		isToday: () => get().selectedDate === moment(new Date()).format("YYYY-MM-DD"),
		error: null,
		resetError: () => set({ error: null }),
	})
	// 	{
	// 		name: "selection-storage",
	// 		storage: createJSONStorage(() => AsyncStorage),
	// 	}
	// )
);
