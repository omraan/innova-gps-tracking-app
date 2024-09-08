import { useRouteSessionStore } from "@/hooks/useRouteSessionStore";
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import Orders from ".";
import Settings from "./settings";

const Tab = createBottomTabNavigator();

export default function Layout() {
	if (__DEV__) {
		// Adds messages only in a dev environment
		loadDevMessages();
		loadErrorMessages();
	}

	const { routeSession } = useRouteSessionStore();

	return (
		<Tabs screenOptions={{ tabBarActiveTintColor: "blue" }}>
			<Tabs.Screen
				name="index"
				options={{
					title: "Orders",
					headerShown: false,
					tabBarIcon: ({ focused, color }) => (
						<Icon size={28} name={focused ? "navigate" : "navigate-outline"} color={color} />
					),
					tabBarLabel: () => null,
				}}
			/>

			<Tabs.Screen
				name="settings"
				options={{
					title: "Settings",
					headerShown: true,
					tabBarIcon: ({ focused, color }) => (
						<Icon size={28} name={focused ? "settings" : "settings-outline"} color={color} />
					),
					tabBarLabel: () => null,
				}}
			/>
		</Tabs>
	);
}
