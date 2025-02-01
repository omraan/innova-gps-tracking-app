import { useLiveLocationStore } from "@/hooks/useLocationStore";
import { defineLocationTask, UPDATE_LOCATION_TASK } from "@/lib/backgroundLocationTask";
import { useAuth } from "@clerk/clerk-expo";
import { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position";
import { format } from "date-fns-tz";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import moment from "moment";
import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { useDispatch } from "./DispatchProvider";
import { useRoute } from "./RouteProvider";

const LocationContext = createContext<{
	liveLocation: LiveLocation | null;
	setLiveLocation: (liveLocation: LiveLocation | null) => void;
	isChangingLocation: boolean;
	setIsChangingLocation: (isChanging: boolean) => void;
	followUserLocation: boolean;
	setFollowUserLocation: (followUserLocation: boolean) => void;
	markerCoordinate: Position;
	setMarkerCoordinate: (markerCoordinate: Position) => void;
} | null>(null);

const LocationProvider = ({ children }: PropsWithChildren) => {
	const { userId, orgId } = useAuth();
	const [backgroundTaskRegistered, setBackgroundTaskRegistered] = useState(false);
	const { liveLocation, setLiveLocation, followUserLocation, setFollowUserLocation } = useLiveLocationStore();
	const [isChangingLocation, setIsChangingLocation] = useState<boolean>(false);
	const [markerCoordinate, setMarkerCoordinate] = useState<Position>([0, 0]);

	const { selectedRoute, setSelectedRoute, setRoutes } = useRoute();
	const { setDispatches } = useDispatch();
	useEffect(() => {
		const startBackgroundLocation = async () => {
			if (!selectedRoute) {
				return;
			}
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				console.error("Permission to access location was denied");
				return;
			}

			const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
			if (backgroundStatus !== "granted") {
				console.error("Permission to access background location was denied");
				return;
			}

			const routeId = selectedRoute?.name;
			defineLocationTask(userId!, orgId!, routeId!, setLiveLocation);
			setBackgroundTaskRegistered(true);
			console.log("Start location sync");

			await Location.startLocationUpdatesAsync(UPDATE_LOCATION_TASK, {
				accuracy: Location.Accuracy.High,
				timeInterval: 20000,
				distanceInterval: 100,
				foregroundService: {
					notificationTitle: "Location Tracking",
					notificationBody: "We are tracking your location in the background",
				},
			});
		};
		let locationSubscription: Location.LocationSubscription | null = null;

		const startLiveTracking = async () => {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				console.error("Permission to access location was denied");
				return;
			}

			locationSubscription = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.High,
					timeInterval: 1000,
					distanceInterval: 10,
				},
				(location) => {
					setLiveLocation({
						latitude: location.coords.latitude,
						longitude: location.coords.longitude,
						speed: location.coords.speed,
						speedInKmh: location.coords.speed ? location.coords.speed * 3.6 : 0,
						timestamp: moment(location.timestamp).toISOString(),
					});
				}
			);
		};

		if (selectedRoute && selectedRoute.value.active && userId && orgId) {
			startBackgroundLocation();
			startLiveTracking();
		}
		return () => {
			if (backgroundTaskRegistered) {
				TaskManager.unregisterTaskAsync(UPDATE_LOCATION_TASK);
				setBackgroundTaskRegistered(false);
			}
			if (locationSubscription) {
				locationSubscription.remove();
			}
		};
	}, [selectedRoute]);

	useEffect(() => {
		if (selectedRoute) {
			setSelectedRoute(undefined);
			setRoutes([]);
			setDispatches([]);
		}
	}, [userId, orgId]);

	return (
		<LocationContext.Provider
			value={{
				liveLocation,
				setLiveLocation,
				isChangingLocation,
				setIsChangingLocation,
				followUserLocation,
				setFollowUserLocation,
				markerCoordinate,
				setMarkerCoordinate,
			}}
		>
			{children}
		</LocationContext.Provider>
	);
};

export default LocationProvider;
export const useLocation = () => {
	const context = useContext(LocationContext);
	if (!context) {
		throw new Error("useLocation must be used within an LocationProvider");
	}
	return context;
};
