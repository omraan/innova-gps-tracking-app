import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type VehicleStore = {
	selectedVehicle: { name: string; value: Vehicle } | null;
	setSelectedVehicle: (vehicle: { name: string; value: Vehicle } | undefined) => void;
	error?: null | {
		message?: string;
		details?: string;
	};
	resetError: () => void;
};

export const useVehicleStore = create<VehicleStore>()(
	persist(
		(set, get) => ({
			selectedVehicle: null,
			setSelectedVehicle: (selectedVehicle) => set(() => ({ selectedVehicle })),
			error: null,
			resetError: () => set({ error: null }),
		}),
		{
			name: "vehicle-storage",
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
);
