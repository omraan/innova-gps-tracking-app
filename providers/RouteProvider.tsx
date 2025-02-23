import { UPDATE_ROUTE } from "@/graphql/mutations";
import { GET_ROUTES } from "@/graphql/queries";
import { useSelectionStore } from "@/hooks/useSelectionStore";
import { getDirections } from "@/services/optimized-trips";
import { useMutation, useQuery } from "@apollo/client";
import { useAuth } from "@clerk/clerk-expo";
import polyline from "@mapbox/polyline";
import * as Location from "expo-location";
import moment from "moment";
import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

const RouteContext = createContext<{
	routes: { name: string; value: Route }[];
	setRoutes(routes: { name: string; value: Route }[]): void;
	filteredRouteStops: { name: string; value: RouteStop }[];
	currentRouteStop: { name: string; value: RouteStop } | null;
	setCurrentRouteStop(currentRouteStop: { name: string; value: RouteStop } | null): void;
	currentStepIndex: number;
	setCurrentStepIndex(currentStepIndex: number): void;
	setSearchQuery(searchQuery: string): void;
	refetchRoutes(): void;
	fetchRoutePolyline(route: { name: string; value: Route }): void;
} | null>(null);

export default function RouteProvider({ children }: PropsWithChildren) {
	const [routes, setRoutes] = useState<{ name: string; value: Route }[]>([]);
	const { selectedRoute, setSelectedRoute, selectedRouteStop, setSelectedRouteStop } = useSelectionStore();
	const { selectedDate, isToday } = useSelectionStore();

	const [currentRouteStop, setCurrentRouteStop] = useState<{ name: string; value: RouteStop } | null>(null);
	const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [filteredRouteStops, setFilteredRouteStops] = useState<{ name: string; value: RouteStop }[]>([]);

	const { data: dataRoutes, refetch: refetchRoutes } = useQuery(GET_ROUTES, {
		variables: {
			date: selectedDate || moment(new Date()).format("yyyy-MM-DD"),
		},
		fetchPolicy: "network-only",
	});

	const [UpdateRoute] = useMutation(UPDATE_ROUTE);

	useEffect(() => {
		if (dataRoutes) {
			console.log("dataRoutes", dataRoutes);
			const newRoutes = dataRoutes.getRoutes.map((r: { name: string; value: Route }) => {
				const { stops, ...rest } = r.value;
				return {
					name: r.name,
					value: {
						...r.value,
						stops: r.value.stops.map((stop: { name: string; value: RouteStop }) => ({
							name: stop.name,
							value: {
								...stop.value,
								route: { ...rest, id: r.name },
								displayName:
									// If the stop is a dispatch, show the company name or the customer name
									stop.value.dispatch
										? stop.value.dispatch?.customer.type === "COMMERCIAL"
											? stop.value.dispatch?.customer.companyName
											: (stop.value.dispatch?.customer.firstName
													? stop.value.dispatch.customer.firstName + " "
													: "") + stop.value.dispatch.customer.lastName
										: // Else show the transit point title
										  stop.value.transitPoint.title,
								active: r.value.actual.timeStart && !r.value.actual.timeEnd,
							},
						})),
					},
				};
			});

			setRoutes(newRoutes);
		}
	}, [dataRoutes]);

	const { orgId } = useAuth();

	useEffect(() => {
		if (orgId) {
			refetchRoutes();
		}
	}, [selectedDate, orgId]);
	useEffect(() => {
		const filtered = selectedRoute?.value.stops.filter((stop: { name: string; value: RouteStop }) => {
			const query = searchQuery.toLowerCase();
			return (
				stop.value.location.title.toLowerCase().includes(query) ||
				stop.value.dispatch?.customer.companyName?.toLowerCase().includes(query) ||
				stop.value.dispatch?.customer.firstName?.toLowerCase().includes(query) ||
				stop.value.dispatch?.customer.lastName?.toLowerCase().includes(query)
			);
		});
		setFilteredRouteStops(filtered || selectedRoute?.value.stops || []);
	}, [searchQuery, selectedRoute]);

	const fetchRoutePolyline = async (route: { name: string; value: Route }) => {
		let newRoute: { name: string; value: Route } | null = route || selectedRoute || null;

		if (newRoute && isToday()) {
			const { coords } = await Location.getCurrentPositionAsync();
			const { latitude, longitude } = coords;

			const selectionStops = newRoute.value.stops
				.filter((stop) => !["Completed", "Failed"].includes(stop.value.status))
				.filter((stop) => stop.value.type !== "START_POINT")
				.filter((stop) => stop.value.location.longitude !== 0)
				.sort((a, b) => a.value.sequence! - b.value.sequence!)
				.slice(0, 14);
			let startLocation = { latitude, longitude };

			const response = await getDirections(
				startLocation,
				selectionStops.map((stop) => ({
					latitude: stop.value.location.latitude,
					longitude: stop.value.location.longitude,
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

			const newSelectionStops = selectionStops.map((stop, index) => {
				return {
					name: stop.name,
					value: {
						...stop.value,
						estimation: {
							...stop.value.estimation,
							duration: routes[0].legs[index].duration,
							distance: routes[0].legs[index].distance,
							steps: routes[0].legs[index].steps.filter((step: Step, index: number) => index !== 0),
						},
					},
				};
			});

			newRoute = {
				name: newRoute.name,
				value: {
					...newRoute.value,
					coordinates: polyline.decode(routes[0].geometry).map((c) => [c[1], c[0]]),
					stops: newRoute.value.stops.map((stop, index) => {
						const newStop = newSelectionStops.find((d) => d.name === stop.name);
						return {
							name: stop.name,
							value: {
								...stop.value,
								estimation: newStop ? newStop.value.estimation : stop.value.estimation,
							},
						};
					}),
				},
			};
		}
		setSelectedRoute(newRoute);
	};

	return (
		<RouteContext.Provider
			value={{
				routes,
				setRoutes,
				refetchRoutes,
				filteredRouteStops,
				currentRouteStop,
				setCurrentRouteStop,
				currentStepIndex,
				setCurrentStepIndex,
				setSearchQuery,
				fetchRoutePolyline,
			}}
		>
			{children}
		</RouteContext.Provider>
	);
}
export const useRoute = () => {
	const context = useContext(RouteContext);
	if (!context) {
		throw new Error("useRoute must be used within an RouteProvider");
	}
	return context;
};
