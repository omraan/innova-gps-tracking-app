import { auth } from "@/firebase";
import { client } from "@/graphql/client";
import { useAuth } from "@clerk/clerk-expo";
import { useNavigationState } from "@react-navigation/native";
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
		let isMounted = true;

		const handleSignIn = async () => {
			if (isSignedIn) {
				setIsLoading(true);
				try {
					const token = await getToken({ template: "integration_firebase" });
					if (token && isMounted) {
						await signInWithToken(token);
					}
					if (currentRoute === "/sign-in" && isMounted) {
						router.replace("/");
					}
				} catch (error) {
					console.error("Error during sign-in:", error);
				} finally {
					if (isMounted) {
						setIsLoading(false);
					}
				}
			}
		};

		handleSignIn();

		return () => {
			isMounted = false;
		};
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
