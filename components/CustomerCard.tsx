import { useNavigation } from "@react-navigation/native";
import { Card, Icon } from "@rneui/themed";
import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useTailwind } from "tailwind-rn";
import useCustomerOrders from "../hooks/useCustomerOrders";
import { CustomerScreenNavigationProp } from "../screens/CustomersScreen";

const CustomerCard = (customer: Customer) => {
	// const { loading, error, orders } = useCustomerOrders(userId);
	const tw = useTailwind();
	const navigation = useNavigation<CustomerScreenNavigationProp>();
	return (
		<TouchableOpacity
			onPress={() =>
				navigation.navigate("CustomerModal", {
					customer: customer,
				})
			}
		>
			<Card containerStyle={[tw("mx-5 my-2 border-0 rounded py-5 px-5 bg-white"), { elevation: 2 }]}>
				<View style={tw("flex-row justify-between")}>
					<View style={tw("flex-row items-center")}>
						<View
							style={tw(
								"bg-gray-200 w-[60px] items-center px-2 py-1 h-8 flex-col justify-center rounded mr-5"
							)}
						>
							<Text style={tw("text-xs font-bold text-primary")}>{customer.code}</Text>
						</View>
						<View style={tw("flex")}>
							<Text style={tw("text-lg text-primary font-bold")}>{customer.name}</Text>
						</View>
					</View>
				</View>
			</Card>
		</TouchableOpacity>
	);
};

export default CustomerCard;
