import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Icon } from "@rneui/themed";
import React, { useEffect, useRef } from "react";
import { FlatList, Linking, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
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
		params: { customer },
	} = useRoute<ModalScreenRoutProp>();

	const mapRef = useRef<MapView>(null);

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
					</Pressable>
				</View>
			</View>
			<View style={{ flex: 1 }}>
				<MapView
					style={StyleSheet.absoluteFillObject}
					provider={PROVIDER_GOOGLE}
					initialRegion={{
						latitude: customer.lat,
						longitude: customer.lng,
						latitudeDelta: 0.005,
						longitudeDelta: 0.005,
					}}
					ref={mapRef}
					// style={[tw("w-full"), { flexGrow: 1, height: 400 }]}
				>
					{customer.lat && customer.lng && (
						<Marker
							coordinate={{
								latitude: customer.lat,
								longitude: customer.lng,
							}}
							title="Delivery Location"
							description={customer.city}
							identifier="destination"
						>
							<Callout style={tw("w-[150px] py-5 px-3")}>
								<Text style={tw("mb-5")}>{customer.city}</Text>
							</Callout>
						</Marker>
					)}
				</MapView>
			</View>
		</View>
	);
};

export default ModalScreen;
