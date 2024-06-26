import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Icon } from "@rneui/themed";
import React, { useEffect, useRef } from "react";
import { FlatList, Linking, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTailwind } from "tailwind-rn";
import { CustomerMap } from "../components/CustomerMap";
import DeliveryCard from "../components/DeliveryCard";
import { RootStackParamList } from "../navigator/RootNavigator";
import { TabStackParamList } from "../navigator/TabNavigator";

type ModalScreenNavigationProp = CompositeNavigationProp<
	BottomTabNavigationProp<TabStackParamList>,
	NativeStackNavigationProp<RootStackParamList, "CustomerModal">
>;

type ModalScreenRoutProp = RouteProp<RootStackParamList, "CustomerModal">;

const CustomerModalScreen = () => {
	const tw = useTailwind();
	const navigation = useNavigation<ModalScreenNavigationProp>();
	const {
		params: { customer },
	} = useRoute<ModalScreenRoutProp>();

	useEffect(() => {
		navigation.setOptions({
			headerRight: () => {
				return (
					<TouchableOpacity onPress={focusMap}>
						<View style={tw("p-8")}>
							<Text>Focus</Text>
						</View>
					</TouchableOpacity>
				);
			},
		});
	}, []);

	const focusMap = () => {
		const url = `http://maps.google.com/maps?daddr=${customer.lat},${customer.lng}`;
		Linking.openURL(url);
	};

	return (
		<View style={{ flex: 1 }}>
			<TouchableOpacity onPress={navigation.goBack} style={tw("absolute right-5 top-5 z-10")}>
				<Icon name="close" type="MaterialIcons" />
			</TouchableOpacity>

			<View style={{ marginTop: 10 }}>
				<View style={[tw("py-5 border-b border-gray-300 px-10")]}>
					<Text style={[tw("text-center text-xl font-bold text-gray-600")]}>{customer.name}</Text>
					<Text style={[tw("text-center italic text-sm")]}>Code: {customer.code}</Text>
					<Pressable
						style={tw("bg-gray-500 px-5 py-2  my-3 rounded")}
						onPress={() =>
							Linking.openURL(`http://maps.google.com/maps?daddr=${customer.lat},${customer.lng}`)
						}
					>
						<Text style={tw("text-white text-center")}>Navigate with Google Maps</Text>
						<CustomerMap customer={customer} />
					</Pressable>
				</View>
			</View>
		</View>
	);
};

export default CustomerModalScreen;
