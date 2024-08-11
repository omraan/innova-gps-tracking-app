import { client } from "@/graphql/client";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider } from "@/providers/AuthProvider";
import utilities from "@/tailwind.json";
import { ApolloProvider } from "@apollo/client";
import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Redirect, Slot, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useLayoutEffect } from "react";
import "react-native-reanimated";
import { TailwindProvider } from "tailwind-rn";

const tokenCache = {
	async getToken(key: string) {
		try {
			const item = await SecureStore.getItemAsync(key);
			if (item) {
				console.log(`${key} was used 🔐 \n`);
			} else {
				console.log("No values stored under key: " + key);
			}
			return item;
		} catch (error) {
			console.error("SecureStore get item error: ", error);
			await SecureStore.deleteItemAsync(key);
			return null;
		}
	},
	async saveToken(key: string, value: string) {
		try {
			await SecureStore.setItemAsync(key, value);
			return;
		} catch (err) {
			console.error("Error saving token: ", err);
			return;
		}
	},
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
	throw new Error("Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env");
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return (
		// @ts-ignore - TailwinProvider is missing type definition
		<TailwindProvider utilities={utilities}>
			<ThemeProvider value={DefaultTheme}>
				<ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
					<ClerkLoaded>
						<AuthProvider>
							<ApolloProvider client={client}>
								<Stack screenOptions={{ headerBackTitle: "Back" }}>
									<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
									<Stack.Screen name="(auth)" options={{ headerShown: false }} />
								</Stack>
							</ApolloProvider>
						</AuthProvider>
					</ClerkLoaded>
				</ClerkProvider>
			</ThemeProvider>
		</TailwindProvider>
	);
}
