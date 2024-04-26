import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Text, View } from "react-native";
import ModalScreen from "../screens/CustomerModalScreen";
import OrderCreateScreen from "../screens/OrderCreateScreen";
import OrderScreen from "../screens/OrderScreen";
import TabNavigator from "./TabNavigator";

export type RootStackParamList = {
	Main: undefined;
	CustomerModal: { customer: Customer };
	Order: { order: Order };
	OrderCreate: undefined;
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
				<RootStack.Screen options={{ headerShown: false }} name="CustomerModal" component={ModalScreen} />
			</RootStack.Group>
			<RootStack.Group>
				<RootStack.Screen name="Order" component={OrderScreen} />
			</RootStack.Group>
			<RootStack.Group>
				<RootStack.Screen name="OrderCreate" component={OrderCreateScreen} />
			</RootStack.Group>
		</RootStack.Navigator>
	);
};

export default RootNavigator;
