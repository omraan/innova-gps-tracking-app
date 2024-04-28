import { useNavigation } from "@react-navigation/native";
import { Card, Icon } from "@rneui/themed";
import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTailwind } from "tailwind-rn";
import colors from "../colors";
import { OrdersScreenNavigationProp } from "../screens/OrdersScreen";

type OrderCardProps = {
	order: OrderExtended;
	orderId: string;
};

const OrderCard = ({ order, orderId }: OrderCardProps) => {
	const tw = useTailwind();
	const navigation = useNavigation<OrdersScreenNavigationProp>();

	return (
		<TouchableOpacity
			onPress={() =>
				navigation.navigate("OrderModal", {
					order: order,
					orderId: orderId,
				})
			}
		>
			<Card containerStyle={tw("px-5 rounded-lg w-full mx-auto")}>
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
					<View style={tw("flex-1 ml-5")}>
						<Text style={[tw("text-gray-400 text-lg font-bold ")]}>{order.customer.name}</Text>
						<Text style={tw("text-gray-500 text-sm")}>{order.customer.code}</Text>
					</View>
					<View style={tw("flex-row items-center")}>
						<Icon style={tw("ml-2")} name="box" type="feather" color={colors.primary} />
					</View>
				</View>
			</Card>
		</TouchableOpacity>
	);
};

export default OrderCard;
