import { getOptimizedTrip } from "@/services/optimized-trips";
import polyline from "@mapbox/polyline";
import { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position";
import * as Location from "expo-location";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { LatLng } from "react-native-maps";
import { useOrder } from "./OrderProvider";

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
	route: RouteProps | null;
	setRoute: any;
	routeCoordinates: Position[] | null;
} | null>(null);

export const RouteProvider = ({ children }: PropsWithChildren) => {
	const [route, setRoute] = useState<RouteProps | null>(null);
	const { orders, setOrders } = useOrder();

	const [routeCoordinates, setRouteCoordinates] = useState<Position[] | null>(null);
	useEffect(() => {
		const fetchRoute = async () => {
			const myLocation = await Location.getCurrentPositionAsync();
			const res = await getOptimizedTrip(
				{
					latitude: myLocation.coords.latitude,
					longitude: myLocation.coords.longitude,
				},
				orders.map((order: CustomerOrders) => {
					return {
						latitude: order.customer.lat,
						longitude: order.customer.lng,
					};
				})
			);
			setRoute(res);
		};
		// console.log("Something happening", JSON.stringify(orders, null, 2));
		if (orders.length > 0 && !route) {
			fetchRoute();
		}
	}, [orders]);

	useEffect(() => {
		if (!route) return;
		const { waypoints } = route;

		const newOrders = orders.map((order, indexOrder) => {
			const waypoint = waypoints.find((waypoint, indexWaypoint) => {
				// First waypoint is the start location, so we need to skip it.
				return indexWaypoint - 1 === indexOrder;
			});

			if (waypoint) {
				return {
					...order,
					value: {
						...order,
						routeIndex: waypoint.waypoint_index,
					},
				};
			}
			return order;
		});
		setOrders(newOrders);

		const decodedCoordinates = polyline.decode(route.trips[0].geometry).map((c) => [c[1], c[0]]);

		setRouteCoordinates(decodedCoordinates);
	}, [route]);
	return <RouteContext.Provider value={{ route, setRoute, routeCoordinates }}>{children}</RouteContext.Provider>;
};

export const useRoute = () => {
	const context = useContext(RouteContext);
	if (!context) {
		throw new Error("useRoute must be used within a RouteProvider");
	}
	return context;
};
