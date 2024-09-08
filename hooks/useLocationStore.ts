import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type LiveLocationStore = {
	liveLocation: LiveLocation | null;
	setLiveLocation: (liveLocation: LiveLocation) => void;
	error?: null | {
		message?: string;
		details?: string;
	};
	resetError: () => void;
};

export const useLiveLocationStore = create<LiveLocationStore>()(
	persist(
		(set, get) => ({
			liveLocation: null,
			setLiveLocation: (liveLocation) => set(() => ({ liveLocation })),
			error: null,
			resetError: () => set({ error: null }),
		}),
		{
			name: "liveLocation-storage",
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
);
