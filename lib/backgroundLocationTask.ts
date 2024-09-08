import { db } from "@/firebase";
import { format } from "date-fns-tz";
import * as TaskManager from "expo-task-manager";
import { child, push, ref, update } from "firebase/database";

export const UPDATE_LOCATION_TASK = "background-location-task";

export const defineLocationTask = (userId: string, orgId: string, setLiveLocation: (location: any) => void) =>
	TaskManager.defineTask(UPDATE_LOCATION_TASK, async ({ data, error }: any) => {
		if (error) {
			console.error(error);
			return;
		}
		if (data) {
			const { locations } = data;
			const location = locations[0];
			if (location && userId && orgId) {
				const { latitude, longitude, speed, heading } = location.coords;
				const speedInKmh = (speed || 0) * 3.6;
				const trackingRef = ref(db, `organizations/${orgId}/tracking/`);

				const newDate = format(new Date(), "yyyy-MM-dd");
				const updates: { [key: string]: any } = {};

				const newTracking = {
					latitude,
					longitude,
					speed,
					speedInKmh,
					timestamp: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
				};
				setLiveLocation(newTracking);
				const newTrackingRef = push(child(trackingRef, `${newDate}/users/${userId}`));
				const newTrackingKey = newTrackingRef.key;

				updates[`${newDate}/users/${userId}/${newTrackingKey}`] = newTracking;
				updates[`current/users/${userId}`] = newTracking;
				await update(trackingRef, updates);
			}
		}
	});
