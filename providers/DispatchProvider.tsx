import { GET_DISPATCHES } from "@/graphql/queries";
import { useDateStore } from "@/hooks/useDateStore";
import { getRelatedOrders } from "@/lib/getRelatedOrders";
import { getDirections } from "@/services/optimized-trips";
import { useQuery } from "@apollo/client";
import polyline from "@mapbox/polyline";
import { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position";
import * as Location from "expo-location";
import moment from "moment";
import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { useRoute } from "./RouteProvider";

const DispatchContext = createContext<{
	dispatches: { name: string; value: DispatchExtended }[];
	setDispatches(dispatches: { name: string; value: DispatchExtended }[]): void;
	selectedDispatch: { name: string; value: DispatchExtended } | undefined;
	setSelectedDispatch(selectedDispatch: { name: string; value: DispatchExtended } | undefined): void;
	setSearchQuery(searchQuery: string): void;
	filteredDispatches: { name: string; value: DispatchExtended }[];
	routeCoordinates: Position[] | null;
} | null>(null);

export default function DispatchProvider({ children }: PropsWithChildren) {
	const [dispatches, setDispatches] = useState<{ name: string; value: DispatchExtended }[]>([]);
	const [selectedDispatch, setSelectedDispatch] = useState<{ name: string; value: DispatchExtended }>();
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [filteredDispatches, setFilteredDispatches] = useState<{ name: string; value: DispatchExtended }[]>([]);
	const [routeCoordinates, setRouteCoordinates] = useState<Position[] | null>(null);

	const { selectedDate } = useDateStore();
	const { selectedRoute } = useRoute();

	const { data, loading, error, refetch } = useQuery(GET_DISPATCHES, {
		variables: {
			routeId: selectedRoute?.name,
		},
		fetchPolicy: "network-only",
	});

	useEffect(() => {
		if (data) {
			setDispatches(data.getDispatches || []);
		}
	}, [data]);

	useEffect(() => {
		refetch();
	}, [selectedDate, refetch]);

	useEffect(() => {
		const filtered = dispatches.filter((dispatch: { name: string; value: DispatchExtended }) => {
			const query = searchQuery.toLowerCase();
			return (
				dispatch.value.customer.name.toLowerCase().includes(query) ||
				dispatch.value.orders?.some((order) => order.orderNumber?.toString().includes(query)) ||
				dispatch.value.customer.streetName?.toLowerCase().includes(query) ||
				dispatch.value.customer.streetNumber?.toLowerCase().includes(query)
			);
		});
		setFilteredDispatches(filtered);
	}, [searchQuery, dispatches]);

	const fetchRoutePolyline = async () => {
		if (dispatches && dispatches.length > 0 && selectedDate === moment(new Date()).format("YYYY-MM-DD")) {
			const { coords } = await Location.getCurrentPositionAsync();
			const { latitude, longitude } = coords;

			const selectionDispatches = dispatches
				.filter((dispatch) => !["Completed", "Failed"].includes(dispatch.value.status))
				.filter((dispatch) => dispatch.value.customer.lat !== 0)
				.sort((a, b) => a.value.route.index! - b.value.route.index!)
				.slice(0, 14);
			let startLocation = { latitude, longitude };

			const response = await getDirections(
				startLocation,
				selectionDispatches.map((dispatch) => ({
					latitude: dispatch.value.customer.lat,
					longitude: dispatch.value.customer.lng,
				}))
			);
			if (!response.success) return;

			const { waypoints, routes } = response;
			if (!response.success) {
				Toast.show({
					type: "error",
					text1: "Error",
					text2: "Failed to fetch route",
				});
				return;
			}
			const newSelectionDispatches = selectionDispatches.map((dispatch, index) => {
				return {
					name: dispatch.name,
					value: {
						...dispatch.value,
						route: {
							...dispatch.value.route,
							// index: index + 1,
							duration: routes[0].legs[index].duration,
							distance: routes[0].legs[index].distance,
						},
					},
				};
			});

			const newDispatches = dispatches.map((dispatch, index) => {
				const newDispatch = newSelectionDispatches.find((d) => d.name === dispatch.name);
				return {
					name: dispatch.name,
					value: {
						...dispatch.value,
						route: newDispatch ? newDispatch.value.route : dispatch.value.route,
					},
				};
			});

			console.log("response", routes[0].geometry);

			setFilteredDispatches(newDispatches);
			setRouteCoordinates(polyline.decode(routes[0].geometry).map((c) => [c[1], c[0]]));
		} else {
			setRouteCoordinates(null);
		}
	};

	useEffect(() => {
		fetchRoutePolyline();
	}, [dispatches]);

	return (
		<DispatchContext.Provider
			value={{
				dispatches,
				setDispatches,
				selectedDispatch,
				setSelectedDispatch,
				setSearchQuery,
				filteredDispatches,
				routeCoordinates,
			}}
		>
			{children}
		</DispatchContext.Provider>
	);
}
export const useDispatch = () => {
	const context = useContext(DispatchContext);
	if (!context) {
		throw new Error("useDispatch must be used within an DispatchProvider");
	}
	return context;
};
