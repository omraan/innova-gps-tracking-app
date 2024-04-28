import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Icon } from "@rneui/themed";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Linking, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Callout, CalloutSubview, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useTailwind } from "tailwind-rn";
import UserContext from "../UserContext";
import { db, push, ref, set } from "../firebase";
import { RootStackParamList } from "../navigator/RootNavigator";
import { TabStackParamList } from "../navigator/TabNavigator";

type ModalScreenNavigationProp = CompositeNavigationProp<
	BottomTabNavigationProp<TabStackParamList>,
	NativeStackNavigationProp<RootStackParamList, "OrderModal">
>;

type ModalScreenRoutProp = RouteProp<RootStackParamList, "OrderModal">;

const OrderModalScreen = () => {
	const tw = useTailwind();
	const [modalVisible, setModalVisible] = useState(false);

	const navigation = useNavigation<ModalScreenNavigationProp>();
	const {
		params: { order, orderId },
	} = useRoute<ModalScreenRoutProp>();

	const mapRef = useRef<MapView>(null);

	const [status, setStatus] = useState<string>(order?.status ?? "open");

	const userContext = React.useContext(UserContext);

	if (!userContext) {
		throw new Error("UserContext is null");
	}
	const { userId } = userContext;

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
		const url = `http://maps.google.com/maps?daddr=${order.customer.lat},${order.customer.lng}`;
		Linking.openURL(url);
	};

	const onMarkerSubmit = () => {
		const newStatus = status === "open" ? "completed" : "open";
		const newDate = new Date();
		setStatus(newStatus);
		// Create a new customer in the firebase realtime database
		set(ref(db, `orders/${orderId}/status`), newStatus);

		const newEventRef = push(ref(db, `orders/${orderId}/events`), {
			createdBy: userId,
			status: newStatus,
			timestamp: Number(newDate),
			name: "Status Changed",
		});
	};
	return (
		<View style={{ flex: 1 }}>
			<TouchableOpacity onPress={navigation.goBack} style={tw("absolute right-5 top-5 z-10")}>
				<Icon name="close" type="MaterialIcons" />
			</TouchableOpacity>

			<View style={{ marginTop: 10 }}>
				<View style={[tw("py-5 border-b border-gray-300 px-10")]}>
					<Text style={[tw("text-center text-xl font-bold text-gray-600")]}>{order.customer.name}</Text>
					<Text style={[tw("text-center italic text-sm")]}>Code: {order.customer.code}</Text>
					<Pressable
						style={tw("bg-gray-500 px-5 py-2  my-3 rounded")}
						onPress={() =>
							Linking.openURL(
								`http://maps.google.com/maps?daddr=${order.customer.lat},${order.customer.lng}`
							)
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
						latitude: order.customer.lat,
						longitude: order.customer.lng,
						latitudeDelta: 0.005,
						longitudeDelta: 0.005,
					}}
					ref={mapRef}
					// style={[tw("w-full"), { flexGrow: 1, height: 400 }]}
				>
					{order.customer.lat && order.customer.lng && (
						<Marker
							coordinate={{
								latitude: order.customer.lat,
								longitude: order.customer.lng,
							}}
							title={order.customer.name}
							description={order.customer.city}
							identifier="destination"
							pinColor={status === "open" ? "red" : "green"}
							onPress={() => setModalVisible(true)}
						/>
					)}
				</MapView>
				<Modal
					animationType="slide"
					transparent={true}
					visible={modalVisible}
					onRequestClose={() => {
						setModalVisible(!modalVisible);
					}}
				>
					<View
						style={{
							flex: 1,
							justifyContent: "center",
							alignItems: "center",
							backgroundColor: "rgba(0, 0, 0, 0.5)", // Optional: adds a semi-transparent background
						}}
					>
						<View
							style={{
								margin: 20,
								backgroundColor: "white",
								padding: 35,
								alignItems: "center",
								shadowColor: "#000",
								shadowOffset: { width: 0, height: 2 },
								shadowOpacity: 0.25,
								shadowRadius: 4,
								elevation: 5,
							}}
						>
							<Text style={tw("text-center mb-4")}>Do you want to change the status of this order?</Text>
							<Text style={tw("text-center mb-4")}>{userId}</Text>
							<View style={tw("flex-row justify-between items-center")}>
								<Pressable
									onPress={() => {
										setModalVisible(false);
										onMarkerSubmit();
									}}
									style={tw("flex-1 bg-green-500 rounded py-4 mr-1")}
								>
									<Text style={tw("text-center text-white")}>Yes</Text>
								</Pressable>
								<Pressable
									onPress={() => {
										setModalVisible(false);
									}}
									style={tw("flex-1 bg-red-500 rounded py-4 ml-1")}
								>
									<Text style={tw("text-center text-white")}>No</Text>
								</Pressable>
							</View>
						</View>
					</View>
				</Modal>
			</View>
		</View>
	);
};

export default OrderModalScreen;
