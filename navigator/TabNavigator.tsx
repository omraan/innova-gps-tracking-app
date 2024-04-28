import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "@rneui/themed";
import { signOut } from "firebase/auth";
import React, { useLayoutEffect } from "react";
import colors from "../colors";
import { auth } from "../firebase";
import CustomersScreen from "../screens/CustomersScreen";
import OrderCreateScreen from "../screens/OrderCreateScreen";
import OrdersScreen from "../screens/OrdersScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
export type TabStackParamList = {
	Customers: undefined;
	Orders: undefined;
	OrderCreate: undefined;
	Settings: undefined;
};

const Tab = createBottomTabNavigator<TabStackParamList>();

const TabNavigator = () => {
	const navigation = useNavigation();

	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: false,
		});
	}, []);

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarActiveTintColor: colors.secondary,
				tabBarInactiveTintColor: "gray",
				tabBarIcon: ({ focused, color, size }) => {
					let iconName;
					let type = "entypo";
					if (route.name === "Customers") {
						iconName = "users";
					} else if (route.name === "Orders") {
						iconName = "box";
					} else if (route.name === "OrderCreate") {
						iconName = "plus";
					} else if (route.name === "Settings") {
						iconName = "bars";
						type = "font-awesome";
					}
					return <Icon name={iconName!} type={type} color={focused ? colors.secondary : "gray"} />;
				},
			})}
		>
			<Tab.Screen name="Customers" component={CustomersScreen} />
			<Tab.Screen name="Orders" component={OrdersScreen} />
			<Tab.Screen
				name="OrderCreate"
				component={OrderCreateScreen}
				options={{
					tabBarLabel: "Create Order",
				}}
			/>
			<Tab.Screen name="Settings" component={SettingsScreen} />
		</Tab.Navigator>
	);
};

export default TabNavigator;
