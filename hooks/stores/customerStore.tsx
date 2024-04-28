import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GET_CUSTOMERS } from "../../graphql/queries";
import { asyncStorageAdapter } from "../../lib/asyncStorageAdapter";
import { client } from "../../lib/client";
import { useUserStore } from "./userStore";

// We use GraphQL for gathering information about customers
// For mutations we need to use Firebase Realtime Database directly
// The reason is that Firebase is object-oriented and doesn't fit well with GraphQL queries/mutations
// Therefore we need to flatten the query result to match the structure of the type Customer

type CustomerInit = {
	name: string;
	value: {
		name: string;
		lat: number;
		lng: number;
		email?: string;
		code: string;
		city?: string;
		streetName?: string;
		streetNumber?: number;
		streetSuffix?: string;
		phone_number?: string;
		phone_number_2?: string;
	};
};

type CustomerStore = {
	customers: Customer[];
	setCustomers: (customers: Customer[]) => void;
	initCustomers: () => Promise<boolean>;
	error?: null | {
		message?: string;
		details?: string;
	};
	resetError: () => void;
};

export const useCustomerStore = create<CustomerStore>()(
	persist(
		(set, get) => ({
			customers: [] as Customer[],
			setCustomers: (customers) => set(() => ({ customers })),
			initCustomers: async () => {
				try {
					const { selectedUser } = useUserStore.getState();
					if (selectedUser) {
						const { data } = await client.query({ query: GET_CUSTOMERS });
						const customers: CustomerInit[] = data.getCustomers;

						// Here we flatten the customers object to single list per customer.
						const result = customers.map((customer) => {
							return {
								id: customer.name,
								...customer.value,
							};
						});

						set({
							customers:
								result.filter(
									(row: any) => row.organisationId === selectedUser.selectedOrganisationId
								) || [],
						});
						return true;
					}
					return false;
				} catch (error: unknown) {
					set({
						customers: [],
						error: {
							message: "Failed to fetch customers from the server.",
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
			name: "customer-storage",
			storage: asyncStorageAdapter,
		}
	)
);
