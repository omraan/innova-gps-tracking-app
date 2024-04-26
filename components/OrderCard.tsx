import { useNavigation } from "@react-navigation/native";
import { Card, Icon } from "@rneui/themed";
import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTailwind } from "tailwind-rn";
import colors from "../colors";
import { OrdersScreenNavigationProp } from "../screens/OrdersScreen";
const OrderCard = (order: Order) => {
	const tw = useTailwind();
	const navigation = useNavigation<OrdersScreenNavigationProp>();
	useEffect(() => {
		console.log(order);
	}, []);
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
						<Icon
							name="truck-delivery"
							type="material-community"
							color={colors.secondary}
							style={tw("mb-1")}
						/>
						<Text style={{ fontSize: 10 }}>
							{order.expectedDeliveryDate !== undefined
								? new Date(Number(order.expectedDeliveryDate)).toLocaleDateString()
								: "No date available"}
						</Text>
					</View>
					<View>
						<Text style={[tw("text-gray-400"), { fontSize: 10 }]}>{order.orderCategory}</Text>
						<Text style={tw("text-gray-500 text-xl")}></Text>
					</View>
					<View style={tw("flex-row items-center")}>
						<Icon style={tw("ml-2")} name="box" type="feather" />
					</View>
				</View>
			</Card>
		</TouchableOpacity>
	);
};

export default OrderCard;
