import { GET_ROUTES } from "@/graphql/queries";
import { useDateStore } from "@/hooks/useDateStore";
import { useVehicleStore } from "@/hooks/useVehicleStore";
import { getDirections } from "@/services/optimized-trips";
import { useQuery } from "@apollo/client";
import { useAuth } from "@clerk/clerk-expo";
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
	selectedRoute: { name: string; value: Route } | undefined;
	setSelectedRoute(selectedRoute: { name: string; value: Route } | undefined): void;
} | null>(null);

export const RouteProvider = ({ children }: PropsWithChildren) => {
	const [routes, setRoutes] = useState<{ name: string; value: Route }[]>([]);

	const [selectedRoute, setSelectedRoute] = useState<{ name: string; value: Route }>();
	const { selectedDate } = useDateStore();

	const { orgId } = useAuth();
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
		console.log("trigger");
		if (dataRoutes) {
			setRoutes(
				dataRoutes.getRoutes.map((route: { name: string; value: Route }) => ({
					name: route.name,
					value: { ...route.value, active: route.value.startTime && !route.value.endTime },
				})) || []
			);
		}
	}, [dataRoutes]);

	useEffect(() => {
		refetchRoutes();
	}, [selectedDate]);

	useEffect(() => {
		if (selectedRoute && !routes.find((route) => route.name === selectedRoute.name)) {
			setSelectedRoute(undefined);
		}
	}, [routes, orgId]);

	return (
		<RouteContext.Provider
			value={{
				routes,
				setRoutes,
				refetchRoutes,
				selectedRoute,
				setSelectedRoute,
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
