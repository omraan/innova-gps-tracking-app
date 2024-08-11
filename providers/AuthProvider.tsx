import { auth } from "@/firebase";
import { client } from "@/graphql/client";
import { GET_ORDER_BY_ID, GET_ORDERS_BY_DATE, GET_VEHICLES } from "@/graphql/queries";
import { useAuth } from "@clerk/clerk-expo";
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
	const { isSignedIn, getToken, orgId } = useAuth();
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
				console.log("Firebase Token is refreshed:", firebaseToken);
			}
		});
		return () => unsubscribe();
	}, []);

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
