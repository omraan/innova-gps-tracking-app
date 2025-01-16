import { useLiveLocationStore } from "@/hooks/useLocationStore";
import { useRouteSessionStore } from "@/hooks/useRouteSessionStore";
import { defineLocationTask, UPDATE_LOCATION_TASK } from "@/lib/backgroundLocationTask";
import { useAuth } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { View } from "react-native";
import { LatLng } from "react-native-maps";

const LocationContext = createContext<{
	liveLocation: LiveLocation | null;
	setLiveLocation: (liveLocation: LiveLocation | null) => void;
	isChangingLocation: boolean;
	setIsChangingLocation: (isChanging: boolean) => void;
} | null>(null);

const LocationProvider = ({ children }: PropsWithChildren) => {
	const { userId, orgId } = useAuth();
	const { routeSession, setRouteSession } = useRouteSessionStore();
	const [backgroundTaskRegistered, setBackgroundTaskRegistered] = useState(false);
	const { liveLocation, setLiveLocation } = useLiveLocationStore();
	const [isChangingLocation, setIsChangingLocation] = useState<boolean>(false);

	useEffect(() => {
		const startBackgroundLocation = async () => {
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

			const routeSessionId = routeSession?.id;
			defineLocationTask(userId!, orgId!, routeSessionId!, setLiveLocation);
			setBackgroundTaskRegistered(true);

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

		if (routeSession && userId && orgId) {
			startBackgroundLocation();
		}
		return () => {
			if (backgroundTaskRegistered) {
				TaskManager.unregisterTaskAsync(UPDATE_LOCATION_TASK);
				setBackgroundTaskRegistered(false);
			}
		};
	}, [routeSession]);

	useEffect(() => {
		if (routeSession) {
			setRouteSession(null);
		}
	}, [userId, orgId]);

	return (
		<LocationContext.Provider
			value={{
				liveLocation,
				setLiveLocation,
				isChangingLocation,
				setIsChangingLocation,
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
		throw new Error("useLocation must be used within a LocationProvider");
	}
	return context;
};
