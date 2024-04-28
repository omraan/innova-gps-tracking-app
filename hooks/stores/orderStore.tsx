import { DocumentNode } from "@apollo/client";
import { set as dbSet, push, ref, remove } from "firebase/database";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { db } from "../../firebase";
import { GET_ORDERS, GET_ORDER_BY_ID } from "../../graphql/queries";
import { client } from "../../lib/client";
import { useCustomerStore } from "./customerStore";
import { useUserStore } from "./userStore";
import { useVehicleStore } from "./vehicleStore";
// We use GraphQL for gathering information about Orders
// For mutations we need to use Firebase Realtime Database directly
// The reason is that Firebase is object-oriented and doesn't fit well with GraphQL queries/mutations
// Therefore we need to flatten the query result to match the structure of the type Order

type OrderInit = {
	name: string;
	value: {
		organisationId: string;
		driverId?: string;
		vehicleId?: string;
		customerId: string;
		expectedDeliveryDate?: number;
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

export const useOrderStore = create<OrderState>()(
	persist(
		(set, get) => ({
			orders: [] as OrderExtended[],
			setOrders: (orders) => set(() => ({ orders })),
			initOrders: async () => {
				try {
					const { selectedUser } = useUserStore.getState();
					if (selectedUser) {
						const { data } = await client.query({ query: GET_ORDERS });
						const orders: OrderInit[] = data.getOrders;

						// Here we flatten the Orders object to single list per Order.
						const result = orders.map((order) => {
							return {
								id: order.name,
								...order.value,
							};
						});

						set({
							orders:
								result.filter(
									(row: any) => row.organisationId === selectedUser.selectedOrganisationId
								) || [],
						});
						return true;
					}
					return false;
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

					const currentDate = new Date();

					const orderEvent: RegisterOrderEvent = {
						name: "Order created",
						date: currentDate.getTime(),
						createdBy: selectedUser!.id,
						status: "open",
						currentIndicator: "true",
					};

					// Create a new Order in the firebase realtime database
					const newOrderRef = push(ref(db, "orders"), {
						...formData,
						organisationId: selectedUser!.selectedOrganisationId,
						events: [orderEvent],
					});

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

					// Trying to get a Order by id.
					const existingOrder = state.orders.find((order: Order) => order.id === formData.id);

					// If not, throw an error.
					if (!existingOrder) {
						throw new Error("Order not found.");
					}

					// Destructure the id from the formData so we can update firebase realtime database
					const { id, ...formDataWithoutId } = formData;

					// Set Order in the firebase realtime database
					dbSet(ref(db, "orders/" + id), formDataWithoutId);

					const fullNewOrder = await client.query({ query: GET_ORDER_BY_ID, variables: { id: id } });
					const fullNewOrderConverted = {
						id: fullNewOrder.data.id,
						...fullNewOrder.data.value,
					};

					// Modify Order in the state
					set((state: { orders: OrderExtended[] }) => ({
						orders: state.orders.map((order: OrderExtended) =>
							order.id === id ? fullNewOrderConverted : order
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
					// If the id is null or undefined, throw an error
					if (!id) {
						throw new Error("ID is required to remove a Order");
					}
					// const newOrders = [...state.orders]

					await remove(ref(db, `orders/${id}`));

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
		}
	)
);
