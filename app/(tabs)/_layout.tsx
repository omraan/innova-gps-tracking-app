import { useRouteSessionStore } from "@/hooks/useRouteSessionStore";
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { useAuth } from "@clerk/clerk-expo";
import { Stack, Tabs, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/Ionicons";

export default function Layout() {
	const { routeSession } = useRouteSessionStore();
	const { isSignedIn } = useAuth();
	const router = useRouter();
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		if (isMounted && !isSignedIn) {
			router.push("/sign-in");
		}
	}, [isMounted, isSignedIn, router]);
	return (
		// <Tabs screenOptions={{ tabBarActiveTintColor: "blue" }}>
		// 	<Tabs.Screen
		// 		name="index"
		// 		options={{
		// 			title: "Orders",
		// 			headerShown: false,
		// 			tabBarIcon: ({ focused, color }) => (
		// 				<Icon size={28} name={focused ? "navigate" : "navigate-outline"} color={color} />
		// 			),
		// 			tabBarLabel: () => null,
		// 		}}
		// 	/>

		// 	<Tabs.Screen
		// 		name="settings"
		// 		options={{
		// 			title: "Settings",
		// 			headerShown: true,
		// 			tabBarIcon: ({ focused, color }) => (
		// 				<Icon size={28} name={focused ? "settings" : "settings-outline"} color={color} />
		// 			),
		// 			tabBarLabel: () => null,
		// 		}}
		// 	/>
		// </Tabs>
		<GestureHandlerRootView style={{ flex: 1 }}>
			<Stack screenOptions={{ headerShown: false }} />
		</GestureHandlerRootView>
	);
}
