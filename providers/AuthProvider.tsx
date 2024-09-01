import { auth, child, db, push, ref, set } from "@/firebase";
import { client } from "@/graphql/client";
import { GET_ORDER_BY_ID, GET_ORDERS_BY_DATE, GET_VEHICLES } from "@/graphql/queries";
import { useAuth } from "@clerk/clerk-expo";
import { update } from "@firebase/database";
import { useNavigationState } from "@react-navigation/native";
import { format } from "date-fns-tz";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { onIdTokenChanged, signInWithCustomToken } from "firebase/auth";
import React, { createContext, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

const signInWithToken = async (token: string) => {
	if (token) {
		const userCredentials = await signInWithCustomToken(auth, token);
		const firebaseToken = await userCredentials.user.getIdToken();
		await SecureStore.setItemAsync("firebaseToken", firebaseToken);
	}
};
const AuthContext = createContext(null);

const saveOrgId = async (orgId: string) => {
	await SecureStore.setItemAsync("orgId", orgId);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const { isSignedIn, getToken, orgId, userId } = useAuth();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const router = useRouter();
	const currentRoute = useNavigationState((state) => state?.routes[state.index]?.name);
	useEffect(() => {
		if (isSignedIn) {
			setIsLoading(true);
			getToken({ template: "integration_firebase" })
				.then((token: string | null) => {
					if (token) {
						signInWithToken(token);
					}
				})
				.then(() => {
					if (currentRoute === "/sign-in") {
						router.replace("/");
					}

					setIsLoading(false);
				});
		}
	}, [isSignedIn]);

	useEffect(() => {
		if (orgId && isSignedIn) {
			saveOrgId(orgId).then(() => {
				client.refetchQueries({
					include: "active",
				});
			});
		}
	}, [orgId]);

	useEffect(() => {
		const unsubscribe = onIdTokenChanged(auth, async (user) => {
			if (user) {
				const firebaseToken = await user.getIdToken();
				await SecureStore.setItemAsync("firebaseToken", firebaseToken);
			}
		});
		return () => unsubscribe();
	}, []);
	const watchUserPosition = async () => {
		let { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== "granted") {
			console.error("Permission to access location was denied");
			return;
		}
		if (userId) {
			const locationSubscription = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.High,
					timeInterval: 5000, // Update location every 5 seconds
					distanceInterval: 25, // Update location every 25 meters
				},
				async (location) => {
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
					const newTrackingRef = push(child(trackingRef, `${newDate}/users/${userId}`));
					const newTrackingKey = newTrackingRef.key;

					updates[`${newDate}/users/${userId}/${newTrackingKey}`] = newTracking;
					updates[`current/users/${userId}`] = newTracking;

					await update(trackingRef, updates);
				}
			);

			return () => {
				locationSubscription.remove();
			};
		}
	};

	useEffect(() => {
		watchUserPosition();
	}, [userId, isLoading, orgId]);

	if (isLoading) {
		return (
			<View style={[styles.container, styles.horizontal]}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return <AuthContext.Provider value={null}>{children}</AuthContext.Provider>;
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
	},
	horizontal: {
		flexDirection: "row",
		justifyContent: "space-around",
		padding: 10,
	},
});
