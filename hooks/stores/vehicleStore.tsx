import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GET_VEHICLES } from "../../graphql/queries";
import { client } from "../../lib/client";
import { useUserStore } from "./userStore";

type VehicleInit = {
	name: string;
	value: {
		name: string;
		licensePlate: string;
		organisationId: string;
	};
};

type VehicleStore = {
	vehicles: Vehicle[];
	setVehicles: (vehicles: Vehicle[]) => void;
	initVehicles: () => Promise<boolean>;
	error?: null | {
		message?: string;
		details?: string;
	};
	resetError: () => void;
};

export const useVehicleStore = create<VehicleStore>()(
	persist(
		(set, get) => ({
			vehicles: [],
			setVehicles: (vehicles) => set(() => ({ vehicles })),
			initVehicles: async () => {
				try {
					const { selectedUser } = useUserStore.getState();
					if (selectedUser) {
						const { data } = await client.query({ query: GET_VEHICLES });
						const vehicles: VehicleInit[] = data.getVehicles;
						// Here we flatten the Vehicles object to single list per Vehicle.
						const result = vehicles.map((vehicle) => {
							return {
								id: vehicle.name,
								...vehicle.value,
							};
						});

						set({
							vehicles:
								result.filter(
									(row: any) => row.organisationId === selectedUser.selectedOrganisationId
								) || [],
						});
						return true;
					}
					return false;
				} catch (error: unknown) {
					set({
						vehicles: [],
						error: {
							message: "Failed to fetch Vehicles from the server.",
							details: error instanceof Error ? error.message : "",
						},
					});
					return false;
				}
			},
			error: null,
			resetError: () => set({ error: null }),
		}),
		{
			name: "vehicle-storage",
		}
	)
);
