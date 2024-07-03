import { DocumentNode } from "@apollo/client";
import { set as dbSet, push, ref, remove, update } from "firebase/database";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { db } from "../../firebase";
import { GET_ORDERS, GET_ORDER_BY_ID } from "../../graphql/queries";
import { asyncStorageAdapter } from "../../lib/asyncStorageAdapter";
import { client } from "../../lib/client";
import { useCustomerStore } from "./customerStore";
import { useUserStore } from "./userStore";
import { useVehicleStore } from "./vehicleStore";

type OrderInit = {
	name: string;
	value: {
		driverId?: string;
		vehicleId?: string;
		customerId: string;
		expectedDeliveryDate: number;
		orderCategory: string;
		events: OrderEvent[];
		driver: {
			name: string;
			email: string;
		};
		vehicle: {
			licensePlate: string;
			name: string;
		};
		customer: {
			lat: number;
			lng: number;
			name: string;
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
};

type OrderState = {
	orders: OrderExtended[];
	setOrders: (Orders: OrderExtended[]) => void;
	initOrders: () => Promise<boolean>;
	addOrder: (Order: Order) => Promise<boolean>;
	modifyOrder: (Order: Order) => Promise<boolean>;
	removeOrder: (id: string) => Promise<boolean>;
	error?: null | {
		message?: string;
		details?: string;
	};
	resetError: () => void;
};
function getDifferences(existingOrder: Record<string, any>, formData: Record<string, any>): Record<string, any> {
	const differences: Record<string, any> = {};

	Object.keys(formData).forEach((key) => {
		// Negeer 'events'
		if (key === "events") return;

		// Voeg toe aan 'differences' als het attribuut niet bestaat in 'existingOrder' of als de waarden niet overeenkomen
		if (!(key in existingOrder) || existingOrder[key] !== formData[key]) {
			differences[key] = formData[key];
		}
	});

	return differences;
}

export const useOrderStore = create<OrderState>()(
	persist(
		(set, get) => ({
			orders: [] as OrderExtended[],
			setOrders: (orders) => set(() => ({ orders })),
			initOrders: async () => {
				try {
					const { selectedUser } = useUserStore.getState();
					if (!selectedUser) {
						return false;
					}

					const { data } = await client.query({
						query: GET_ORDERS,
						variables: { organisationId: selectedUser.selectedOrganisationId },
					});

					set({
						orders:
							data.getOrders.map((order: OrderInit) => {
								return {
									id: order.name,
									...order.value,
								};
							}) || [],
					});
					return true;
				} catch (error: unknown) {
					set({
						orders: [],
						error: {
							message: "Failed to fetch Orders from the server.",
							details: error instanceof Error ? error.message : "",
						},
					});
					return false;
				}
			},
			addOrder: async (formData) => {
				try {
					const { id, ...formDataWithoutId } = formData;
					const { selectedUser, users } = useUserStore.getState();
					const { vehicles } = useVehicleStore.getState();
					const { customers } = useCustomerStore.getState();

					if (!selectedUser) return false;

					const currentDate = new Date();

					const orderEvent: OrderEvent = {
						name: "Order created",
						createdAt: new Date().getTime(),
						createdBy: selectedUser.id,
						...formData,
					};

					// Create a new Order in the firebase realtime database
					const newOrderRef = await push(
						ref(db, `organisations/${selectedUser.selectedOrganisationId}/orders`),
						{
							...formData,
							events: [orderEvent],
						}
					);

					// And retrieve new Order's id
					const newOrderId = newOrderRef.key;

					// If the id is null or undefined, throw an error
					if (!newOrderId) {
						throw new Error("Failed to generate ID for new Order");
					}

					const customer = customers.find((customer) => customer.id === formData.customerId);
					if (!customer) {
						throw new Error("Customer not found");
					}
					const vehicle = vehicles.find((vehicle) => vehicle.id === formData.vehicleId);
					const vehicleValues = {
						licensePlate: vehicle?.licensePlate || "",
						name: vehicle?.name || "",
					};

					const driver = users.find((user) => user.id === formData.driverId);
					const driverValues = {
						name: driver?.name || "",
						email: driver?.email || "",
					};
					// if (!driver) {
					// 	throw new Error("Driver not found");
					// }

					set((state: { orders: OrderExtended[] }) => ({
						orders: [
							...state.orders,
							{
								id: newOrderId,
								...formDataWithoutId,
								customer: {
									email: customer.email || "",
									lat: customer.lat,
									lng: customer.lng,
									name: customer.name,
									code: customer.code,
									city: customer.city,
									streetName: customer.streetName,
									streetNumber: customer.streetNumber,
									streetSuffix: customer.streetSuffix,
									phone_number: customer.phone_number,
									phone_number_2: customer.phone_number_2,
								},
								vehicle: vehicleValues,
								driver: driverValues,
							},
						],
					}));
					return true;
				} catch (error: unknown) {
					set({
						error: {
							message: "Failed to add Order to the server.",
							details: error instanceof Error ? error.message : "",
						},
					});
					return false;
				}
			},
			modifyOrder: async (formData) => {
				try {
					const state = get();
					const { selectedUser } = useUserStore.getState();

					if (!selectedUser) return false;

					// Trying to get a Order by id.
					const existingOrder = state.orders.find((order: Order) => order.id === formData.id);

					// If not, throw an error.
					if (!existingOrder) {
						throw new Error("Order not found.");
					}

					const differences = getDifferences(existingOrder, formData);
					const updates: { [key: string]: unknown } = {};

					Object.keys(differences).forEach((key) => {
						updates[
							`/organisations/${selectedUser.selectedOrganisationId}/orders/${existingOrder.id}/${key}`
						] = (differences as any)[key];
					});
					const nextEventIndex = existingOrder.events ? existingOrder.events.length : 0;
					const orderEvent: OrderEvent = {
						name: "Order changed",
						createdAt: new Date().getTime(),
						createdBy: selectedUser.id,
						...differences,
					};
					updates[
						`/organisations/${selectedUser.selectedOrganisationId}/orders/${existingOrder.id}/events/${nextEventIndex}`
					] = orderEvent;

					const updateOrder = await update(ref(db), updates);

					const fullNewOrder = await client.query({
						query: GET_ORDER_BY_ID,
						variables: { organisationId: selectedUser.selectedOrganisationId, id: existingOrder.id },
						fetchPolicy: "network-only",
					});
					const fullNewOrderConverted = {
						id: existingOrder.id,
						...fullNewOrder.data.getOrderById,
					};

					// Modify Order in the state
					set((state: { orders: OrderExtended[] }) => ({
						orders: state.orders.map((order: OrderExtended) =>
							order.id === fullNewOrderConverted.id ? fullNewOrderConverted : order
						),
					}));

					return true;
				} catch (error: unknown) {
					set({
						error: {
							message: "Failed to add Order to the server.",
							details: error instanceof Error ? error.message : "",
						},
					});
					return false;
				}
			},
			removeOrder: async (id) => {
				try {
					const { selectedUser } = useUserStore.getState();

					if (!selectedUser) return false;

					// If the id is null or undefined, throw an error
					if (!id) {
						throw new Error("ID is required to remove a Order");
					}
					await remove(ref(db, `organisations/${selectedUser.selectedOrganisationId}/orders/${id}`));

					const orderToRemove = get().orders.findIndex((order) => order.id === id);
					set((state) => {
						const newOrders = [...state.orders];

						newOrders.splice(orderToRemove, 1);
						return { orders: newOrders };
					});
					return true;
				} catch (error: unknown) {
					set({
						error: {
							message: "Failed remove Order from the server.",
							details: error instanceof Error ? error.message : "",
						},
					});
					return false;
				}
			},

			error: null as { message?: string; details?: string } | null | undefined,
			resetError: () => set({ error: null }),
		}),
		{
			name: "order-storage",
			storage: asyncStorageAdapter,
		}
	)
);
