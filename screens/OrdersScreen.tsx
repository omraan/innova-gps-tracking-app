import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Button, Image } from "@rneui/themed";
import React, { useLayoutEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useTailwind } from "tailwind-rn";
import OrderCard from "../components/OrderCard";
import useOrders from "../hooks/useOrders";
import { RootStackParamList } from "../navigator/RootNavigator";
import { TabStackParamList } from "../navigator/TabNavigator";

export type OrdersScreenNavigationProp = CompositeNavigationProp<
	BottomTabNavigationProp<TabStackParamList, "Orders">,
	NativeStackNavigationProp<RootStackParamList>
>;

const OrdersScreen = () => {
	const tw = useTailwind();
	const navigation = useNavigation<OrdersScreenNavigationProp>();

	const { loading, error, orders } = useOrders();
	const [ascending, setAscending] = useState<Boolean>(false);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: false,
			tabBarLabel: ({ focused, color }) => (
				<Text style={{ color: focused ? "#EB6A7C" : color, fontSize: 10 }}>Orders</Text>
			),
		});
	}, []);

	return (
		<ScrollView style={{ backgroundColor: "#EB6A7C" }}>
			<Image
				style={tw("w-full h-64")}
				source={{ uri: "https://links.papareact.com/m51" }}
				PlaceholderContent={<ActivityIndicator />}
			/>
			<View>
				<Button
					color="pink"
					titleStyle={{ color: "gray", fontWeight: "400" }}
					style={tw("py-2 px-5")}
					onPress={() => setAscending(!ascending)}
				>
					{ascending ? "Showing Oldest First" : "Showing Most Recent First"}
				</Button>
				{orders
					?.sort((a, b) => {
						if (ascending) {
							return new Date(a.createdAt) > new Date(b.createdAt) ? 1 : -1;
						} else {
							return new Date(a.createdAt) < new Date(b.createdAt) ? 1 : -1;
						}
					})
					.map((order) => (
						<OrderCard key={order.trackingId} order={order} />
					))}
			</View>
		</ScrollView>
	);
};

export default OrdersScreen;
