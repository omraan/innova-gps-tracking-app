import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type RouteSession = {
	startTime: number;
	endTime?: number;
	active: boolean;
};

type RouteSessionStore = {
	routeSession: RouteSession | null;
	setRouteSession: (routeSession: RouteSession) => void;
	error?: null | {
		message?: string;
		details?: string;
	};
	resetError: () => void;
};

export const useRouteSessionStore = create<RouteSessionStore>()(
	persist(
		(set, get) => ({
			routeSession: null,
			setRouteSession: (routeSession) => set(() => ({ routeSession })),
			error: null,
			resetError: () => set({ error: null }),
		}),
		{
			name: "routeSession-storage",
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
);
