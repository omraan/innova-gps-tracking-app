import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Icon } from "@rneui/themed";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useTailwind } from "tailwind-rn";
import DeliveryCard from "../components/DeliveryCard";
import useCustomerOrders from "../hooks/useCustomerOrders";
import { RootStackParamList } from "../navigator/RootNavigator";
import { TabStackParamList } from "../navigator/TabNavigator";

type ModalScreenNavigationProp = CompositeNavigationProp<
	BottomTabNavigationProp<TabStackParamList>,
	NativeStackNavigationProp<RootStackParamList, "MyModal">
>;

type ModalScreenRoutProp = RouteProp<RootStackParamList, "MyModal">;

const ModalScreen = () => {
	const tw = useTailwind();
	const navigation = useNavigation<ModalScreenNavigationProp>();
	const {
		params: { name, userId },
	} = useRoute<ModalScreenRoutProp>();

	//const { loading, error, orders } = useCustomerOrders(userId);

	return (
		<View>
			<TouchableOpacity onPress={navigation.goBack} style={tw("absolute right-5 top-5 z-10")}>
				<Icon name="close" type="MaterialIcons" />
			</TouchableOpacity>

			<View style={{ marginTop: 10 }}>
				<View style={[tw("py-5 border-b"), { borderColor: "#59C1CC" }]}>
					<Text style={[tw("text-center text-xl font-bold"), { color: "#59C1CC" }]}>{name}</Text>
					<Text style={[tw("text-center italic text-sm")]}>deliveries</Text>
				</View>
			</View>
			{/* <FlatList
				data={orders}
				contentContainerStyle={{ paddingBottom: 200 }}
				renderItem={({ item: order }) => <DeliveryCard order={order} />}
				keyExtractor={(order) => order.trackingId}
			/> */}
		</View>
	);
};

export default ModalScreen;
