import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Text, View } from "react-native";
import CustomerModalScreen from "../screens/CustomerModalScreen";
import OrderCreateScreen from "../screens/OrderCreateScreen";
import OrderModalScreen from "../screens/OrderModalScreen";
import OrderScreen from "../screens/OrderScreen";
import OrganisationScreen from "../screens/settings/OrganisationScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import TabNavigator from "./TabNavigator";
export type RootStackParamList = {
	Main: undefined;
	CustomerModal: { customer: Customer };
	OrderModal: { order: OrderExtended; orderId: string };
	Order: { order: Order };
	OrderCreate: undefined;
	Settings: undefined;
	Organisation: undefined;
};

const RootNavigator = () => {
	const RootStack = createNativeStackNavigator<RootStackParamList>();

	return (
		<RootStack.Navigator>
			<RootStack.Group>
				<RootStack.Screen name="Main" component={TabNavigator} />
			</RootStack.Group>
			<RootStack.Group
				screenOptions={{
					presentation: "modal",
				}}
			>
				<RootStack.Screen
					options={{ headerShown: false }}
					name="CustomerModal"
					component={CustomerModalScreen}
				/>
			</RootStack.Group>
			<RootStack.Group
				screenOptions={{
					presentation: "modal",
				}}
			>
				<RootStack.Screen options={{ headerShown: false }} name="OrderModal" component={OrderModalScreen} />
			</RootStack.Group>
			<RootStack.Group>
				<RootStack.Screen name="Order" component={OrderScreen} />
			</RootStack.Group>
			<RootStack.Group>
				<RootStack.Screen name="OrderCreate" component={OrderCreateScreen} />
			</RootStack.Group>
			<RootStack.Group>
				<RootStack.Screen name="Settings" component={SettingsScreen} />
			</RootStack.Group>
			<RootStack.Group>
				<RootStack.Screen
					name="Organisation"
					component={OrganisationScreen}
					options={{
						headerBackTitle: "Settings", // Set your custom label here
					}}
				/>
			</RootStack.Group>
		</RootStack.Navigator>
	);
};

export default RootNavigator;
