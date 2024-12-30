import getDistance from "@turf/distance";
import { point } from "@turf/helpers";
import * as Location from "expo-location";
import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

import { GET_ORDERS_BY_DATE } from "@/graphql/queries";
import { useDateStore } from "@/hooks/useDateStore";
import { useVehicleStore } from "@/hooks/useVehicleStore";
import { getRelatedOrders } from "@/lib/getRelatedOrders";
import { useQuery } from "@apollo/client";
import moment from "moment";

const OrderContext = createContext<{
	orders: CustomerOrders[];
	setOrders(orders: CustomerOrders[]): void;
	selectedOrder: CustomerOrders | undefined;
	setSelectedOrder(selectedOrder: CustomerOrders | undefined): void;
} | null>(null);

export default function OrderProvider({ children }: PropsWithChildren) {
	const [orders, setOrders] = useState<any>([]);
	const [selectedOrder, setSelectedOrder] = useState<any>();
	const { selectedDate } = useDateStore();
	const { selectedVehicle } = useVehicleStore();

	const {
		data: dataOrders,
		loading: loadingOrders,
		error,
		refetch,
	} = useQuery(GET_ORDERS_BY_DATE, {
		variables: {
			date: selectedDate || moment(new Date()).format("yyyy-MM-DD"),
		},
		fetchPolicy: "network-only",
	});

	useEffect(() => {
		console.log("dataOrders", dataOrders);
		if (dataOrders) {
			if (dataOrders.getOrdersByDate.length > 0) {
				const relatedOrders = getRelatedOrders(dataOrders.getOrdersByDate);
				setOrders(relatedOrders || []);
			} else {
				setOrders([]);
			}
		}
	}, [dataOrders]);

	useEffect(() => {
		console.log("fetch");
		refetch();
	}, [selectedDate, refetch]);

	useEffect(() => {
		if (dataOrders && dataOrders.getOrdersByDate.length > 0) {
			let relatedOrders = getRelatedOrders(dataOrders.getOrdersByDate);
			console.log("selected vehicles >>> ", selectedVehicle, relatedOrders.length);
			if (selectedVehicle) {
				relatedOrders =
					relatedOrders.filter((order: CustomerOrders) => order.vehicleId === selectedVehicle.name) || [];
			}
			setOrders(relatedOrders);
		}
	}, [selectedVehicle]);

	return (
		<OrderContext.Provider
			value={{
				orders,
				setOrders,
				selectedOrder,
				setSelectedOrder,
			}}
		>
			{children}
		</OrderContext.Provider>
	);
}
export const useOrder = () => {
	const context = useContext(OrderContext);
	if (!context) {
		throw new Error("useOrder must be used within an OrderProvider");
	}
	return context;
};
