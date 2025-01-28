import { GET_ROUTES } from "@/graphql/queries";
import { useDateStore } from "@/hooks/useDateStore";
import { useVehicleStore } from "@/hooks/useVehicleStore";
import { getDirections } from "@/services/optimized-trips";
import { useQuery } from "@apollo/client";
import polyline from "@mapbox/polyline";
import { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position";
import * as Location from "expo-location";
import moment from "moment";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
interface RouteProps {
	code: string;
	waypoints: {
		distance: number;
		name: string;
		location: [number, number];
		waypoint_index: number;
		trips_index: number;
	}[];
	trips: {
		geometry: any;
		legs: {
			distance: number;
			duration: number;
			steps: any;
			summary: string;
			weight: number;
		}[];
		weight_name: string;
		weight: number;
		distance: number;
		duration: number;
	}[];
}
const RouteContext = createContext<{
	routes: { name: string; value: Route }[];
	setRoutes(routes: { name: string; value: Route }[]): void;
	refetchRoutes: () => void;
	selectionRoutes: { name: string; value: Route }[];
	setSelectionRoutes(routes: { name: string; value: Route }[]): void;
	selectedRoute: { name: string; value: Route } | undefined;
	setSelectedRoute(selectedRoute: { name: string; value: Route } | undefined): void;
} | null>(null);

export const RouteProvider = ({ children }: PropsWithChildren) => {
	const [routes, setRoutes] = useState<{ name: string; value: Route }[]>([]);
	const [selectionRoutes, setSelectionRoutes] = useState<{ name: string; value: Route }[]>([]);

	const [selectedRoute, setSelectedRoute] = useState<{ name: string; value: Route }>();
	const { selectedDate } = useDateStore();

	const { selectedVehicle } = useVehicleStore();

	const {
		data: dataRoutes,
		refetch: refetchRoutes,
		error,
	} = useQuery(GET_ROUTES, {
		variables: {
			date: selectedDate || moment(new Date()).format("yyyy-MM-DD"),
		},
		fetchPolicy: "network-only",
	});

	useEffect(() => {
		console.log("Error >>> ", error);
	}, [error]);

	useEffect(() => {
		if (dataRoutes) {
			setRoutes(dataRoutes.getRoutes || []);
		}
	}, [dataRoutes]);

	useEffect(() => {
		refetchRoutes();
	}, [selectedDate]);

	useEffect(() => {
		if (routes && routes.length > 0) {
			let newSelectionRoutes = routes;
			if (selectedVehicle) {
				newSelectionRoutes = routes.filter(
					(route: { name: string; value: Route }) => route.value.vehicleId === selectedVehicle.name
				);
			}
			setSelectionRoutes(newSelectionRoutes);
		}
	}, [selectedVehicle, routes]);

	// useEffect(() => {
	// 	if (selectedRoute && selectedRoute.value.geometry) {
	// 		const coordinates = polyline.decode(selectedRoute.value.geometry).map((c) => [c[1], c[0]]);
	// 		setRouteCoordinates(coordinates);
	// 	}
	// }, [selectedRoute]);

	// useEffect(() => {
	// 	if (!selectedRoute) {
	// 		setRouteCoordinates(null);
	// 		return;
	// 	}
	// 	// const { waypoints } = route;

	// 	// const newOrders = orders.map((order, indexOrder) => {
	// 	// 	const waypoint = waypoints.find((waypoint, indexWaypoint) => {
	// 	// 		// First waypoint is the start location, so we need to skip it.
	// 	// 		return indexWaypoint - 1 === indexOrder;
	// 	// 	});

	// 	// 	if (waypoint) {
	// 	// 		return {
	// 	// 			...order,
	// 	// 			value: {
	// 	// 				...order,
	// 	// 				routeIndex: waypoint.waypoint_index,
	// 	// 			},
	// 	// 		};
	// 	// 	}
	// 	// 	return order;
	// 	// });
	// 	// setOrders(newOrders);

	// 	const decodedCoordinates = polyline.decode(route.trips[0].geometry).map((c) => [c[1], c[0]]);

	// 	setRouteCoordinates(decodedCoordinates);
	// }, [route]);

	return (
		<RouteContext.Provider
			value={{
				routes,
				setRoutes,
				refetchRoutes,
				selectedRoute,
				setSelectedRoute,
				selectionRoutes,
				setSelectionRoutes,
			}}
		>
			{children}
		</RouteContext.Provider>
	);
};

export const useRoute = () => {
	const context = useContext(RouteContext);
	if (!context) {
		throw new Error("useRoute must be used within a RouteProvider");
	}
	return context;
};
