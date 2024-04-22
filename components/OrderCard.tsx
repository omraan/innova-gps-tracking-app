import { useNavigation } from "@react-navigation/native";
import { Card, Icon } from "@rneui/themed";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTailwind } from "tailwind-rn";
import { OrdersScreenNavigationProp } from "../screens/OrdersScreen";

type Props = {
	order: Order;
};

const OrderCard = ({ order }: Props) => {
	const tw = useTailwind();
	const navigation = useNavigation<OrdersScreenNavigationProp>();
	return (
		<TouchableOpacity
			onPress={() =>
				navigation.navigate("Order", {
					order: order,
				})
			}
		>
			<Card containerStyle={tw("px-5 rounded-lg")}>
				<View style={tw("flex-row justify-between items-center")}>
					<View>
						<Icon name="truck-delivery" type="material-community" color={"#EB6A7C"} />
						<Text style={{ fontSize: 10 }}>{new Date(order.createdAt).toDateString()}</Text>
					</View>
					<View>
						<Text style={[tw("text-gray-400"), { fontSize: 10 }]}>
							{order.carrier}-{order.trackingId}
						</Text>
						<Text style={tw("text-gray-500 text-xl")}>{order.trackingItems.customer.name}</Text>
					</View>
					<View style={tw("flex-row items-center")}>
						<Text style={[tw("text-sm"), { color: "#EB6A7C" }]}>{order.trackingItems.items.length} x</Text>
						<Icon style={tw("ml-2")} name="box" type="feather" />
					</View>
				</View>
			</Card>
		</TouchableOpacity>
	);
};

export default OrderCard;
