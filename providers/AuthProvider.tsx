import { auth, db, push, ref, set } from "@/firebase";
import { client } from "@/graphql/client";
import { GET_ORDER_BY_ID, GET_ORDERS_BY_DATE, GET_VEHICLES } from "@/graphql/queries";
import { useAuth } from "@clerk/clerk-expo";
import { format } from "date-fns-tz";
import * as Location from "expo-location";
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

	useEffect(() => {
		if (isSignedIn) {
			setIsLoading(true);
			getToken({ template: "integration_firebase" })
				.then((token: string | null) => {
					if (token) {
						signInWithToken(token);
					}
				})
				.then(() => setIsLoading(false));
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

	useEffect(() => {
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
					(location) => {
						const { latitude, longitude, speed, heading } = location.coords;
						const speedInKmh = (speed || 0) * 3.6;
						push(ref(db, `users/${userId}/${format(new Date(), "yyyy-MM-dd")}`), {
							latitude,
							longitude,
							speed,
							speedInKmh,
							timestamp: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
						});
					}
				);

				return () => {
					locationSubscription.remove();
				};
			}
		};

		watchUserPosition();
	}, [userId]);

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
