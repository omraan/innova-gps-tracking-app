import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useLayoutEffect } from "react";
import { Text, View } from "react-native";
import { useTailwind } from "tailwind-rn";
import DeliveryCard from "../components/DeliveryCard";
import { RootStackParamList } from "../navigator/RootNavigator";
import { TabStackParamList } from "../navigator/TabNavigator";

type OrderScreenNavigationProp = CompositeNavigationProp<
	BottomTabNavigationProp<TabStackParamList>,
	NativeStackNavigationProp<RootStackParamList, "Order">
>;

type OrderScreenRoutProp = RouteProp<RootStackParamList, "Order">;

const OrderScreen = () => {
	const tw = useTailwind();
	const navigation = useNavigation<OrderScreenNavigationProp>();
	const {
		params: { order },
	} = useRoute<OrderScreenRoutProp>();

	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: "test",
			headerTitleStyle: { color: "Black" },
			headerBackTitle: "Deliveries",
			headerTintColor: "pink",
		});
	}, [order]);

	return (
		<View>
			<DeliveryCard order={order} fullWidth />
		</View>
	);
};

export default OrderScreen;
