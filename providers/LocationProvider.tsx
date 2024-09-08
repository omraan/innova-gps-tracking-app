import { useLiveLocationStore } from "@/hooks/useLocationStore";
import { useRouteSessionStore } from "@/hooks/useRouteSessionStore";
import { defineLocationTask, UPDATE_LOCATION_TASK } from "@/lib/backgroundLocationTask";
import { useAuth } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

const LocationProvider = ({ children }: { children: React.ReactNode }) => {
	const { userId, orgId } = useAuth();
	const { routeSession, setRouteSession } = useRouteSessionStore();
	const [backgroundTaskRegistered, setBackgroundTaskRegistered] = useState(false);
	const { setLiveLocation } = useLiveLocationStore();
	useEffect(() => {
		const startBackgroundLocation = async () => {
			console.log("hello worl2");
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

			const isRegistered = await TaskManager.isTaskRegisteredAsync(UPDATE_LOCATION_TASK);

			if (!isRegistered && userId && orgId) {
				console.log("Registering task");
				defineLocationTask(userId, orgId, setLiveLocation);
				setBackgroundTaskRegistered(true);
			}
			await Location.startLocationUpdatesAsync(UPDATE_LOCATION_TASK, {
				accuracy: Location.Accuracy.High,
				timeInterval: 10000,
				distanceInterval: 100,
				foregroundService: {
					notificationTitle: "Location Tracking",
					notificationBody: "We are tracking your location in the background",
				},
			});
		};

		if (routeSession?.active && userId && orgId) {
			startBackgroundLocation();
		}
		return () => {
			if (backgroundTaskRegistered) {
				TaskManager.unregisterTaskAsync(UPDATE_LOCATION_TASK);
				setBackgroundTaskRegistered(false);
			}
		};
	}, [routeSession?.active]);

	useEffect(() => {
		if (routeSession?.active) {
			setRouteSession({ ...routeSession, active: false });
		}
	}, [userId, orgId]);

	return <View style={{ flex: 1 }}>{children}</View>;
};

export default LocationProvider;
