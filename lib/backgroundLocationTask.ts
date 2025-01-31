import { db } from "@/firebase";
import { format } from "date-fns-tz";
import * as TaskManager from "expo-task-manager";
import { child, push, ref, update } from "firebase/database";

export const UPDATE_LOCATION_TASK = "background-location-task";

let lastUpdateTime = 0;
const DEBOUNCE_TIME = 5000; // 5 seconden
const MAX_UPDATES_PER_MINUTE = 60; // Maximaal 60 updates per minuut
let updateCount = 0;
let startTime = Date.now();

export const defineLocationTask = (
	userId: string,
	orgId: string,
	routeId: string,
	setLiveLocation: (location: any) => void
) =>
	TaskManager.defineTask(UPDATE_LOCATION_TASK, async ({ data, error }: any) => {
		if (error) {
			console.error(error);
			return;
		}
		if (data) {
			const { locations } = data;
			const location = locations[0];

			if (location && userId && orgId) {
				const currentTime = Date.now();

				// Rate limiting
				if (currentTime - startTime < 60000) {
					// 1 minuut
					updateCount++;
					if (updateCount > MAX_UPDATES_PER_MINUTE) {
						console.warn("Too many updates, skipping...");
						return;
					}
				} else {
					// Reset the counter every minute
					startTime = currentTime;
					updateCount = 0;
				}

				// Debouncing
				if (currentTime - lastUpdateTime < DEBOUNCE_TIME) {
					return;
				}
				lastUpdateTime = currentTime;

				const { latitude, longitude, speed, heading } = location.coords;
				const speedInKmh = (speed || 0) * 3.6;
				const trackingRef = ref(db, `organizations/${orgId}/tracking/`);

				const newDate = format(new Date(), "yyyy-MM-dd");
				const updates: { [key: string]: any } = {};

				const newTracking = {
					routeId,
					latitude,
					longitude,
					speed,
					speedInKmh,
					timestamp: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
				};
				setLiveLocation(newTracking);
				const newTrackingRef = push(child(trackingRef, `${newDate}/users/${userId}`));
				const newTrackingKey = newTrackingRef.key;

				updates[`${newDate}/routes/${routeId}/${newTrackingKey}`] = newTracking;
				updates[`current/routes/${routeId}`] = newTracking;
				await update(trackingRef, updates);
			}
		}
	});
