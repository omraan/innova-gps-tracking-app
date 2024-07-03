import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Icon as ThIcon } from "@rneui/themed";
import Icon from "react-native-vector-icons/FontAwesome";

import { update } from "firebase/database";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Linking, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Callout, CalloutSubview, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useTailwind } from "tailwind-rn";
import { db, push, ref, set } from "../firebase";
import { useOrderStore } from "../hooks/stores/orderStore";
import { useOrganisationStore } from "../hooks/stores/organisationStore";
import { useUserStore } from "../hooks/stores/userStore";
import { RootStackParamList } from "../navigator/RootNavigator";
import { TabStackParamList } from "../navigator/TabNavigator";

type ModalScreenNavigationProp = CompositeNavigationProp<
	BottomTabNavigationProp<TabStackParamList>,
	NativeStackNavigationProp<RootStackParamList, "OrderModal">
>;

type ModalScreenRoutProp = RouteProp<RootStackParamList, "OrderModal">;

interface OrderEventExtended extends OrderEvent {
	oldLat?: number;
	oldLng?: number;
	newLat?: number;
	newLng?: number;
}

const OrderModalScreen = () => {
	const tw = useTailwind();
	const [modalVisible, setModalVisible] = useState(false);
	const { selectedUser } = useUserStore();
	const { selectedOrganisation } = useOrganisationStore();
	const { orders, setOrders } = useOrderStore();
	const navigation = useNavigation<ModalScreenNavigationProp>();
	const {
		params: { order, orderId },
	} = useRoute<ModalScreenRoutProp>();

	const mapRef = useRef<MapView>(null);

	const [status, setStatus] = useState<{ name: string; color: string }>(
		selectedOrganisation?.settings.statusCategories.find(
			(status) => order.status && status.name.toLocaleLowerCase() === order.status.toLocaleLowerCase()
		) || { name: "Unknown", color: "#000000" }
	);
	const [changingLocation, setChangingLocation] = useState(false);
	const [marker, setMarker] = useState<{ latitude: number; longitude: number }>({
		latitude: order.customer.lat,
		longitude: order.customer.lng,
	});
	const [newMarker, setNewMarker] = useState<{ latitude: number; longitude: number } | null>(null);
	const [refresh, setRefresh] = useState(false);

	const [currentOrder, setCurrentOrder] = useState<OrderExtended>(order);

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

	const onMarkerSubmit = (newStatus: { name: string; color: string }) => {
		const newDate = new Date();
		setStatus(newStatus);
		if (!selectedUser) return false;
		// Create a new customer in the firebase realtime database
		set(ref(db, `/organisations/${selectedUser.selectedOrganisationId}/orders/${orderId}/status`), newStatus.name);

		const updates: { [key: string]: unknown } = {};
		const nextEventIndex = order.events ? order.events.length : 0;

		const orderEvent: OrderEvent = {
			name: "Order changed",
			createdAt: new Date().getTime(),
			createdBy: selectedUser.id,
			status: newStatus.name,
		};
		updates[`/organisations/${selectedUser.selectedOrganisationId}/orders/${orderId}/events/${nextEventIndex}`] =
			orderEvent;

		const updateOrder = update(ref(db), updates);
	};

	const onChangingLocationSubmit = (newLocation: { latitude: number; longitude: number } | null) => {
		try {
			if (!selectedUser) return false;
			set(
				ref(db, `organisations/${selectedUser.selectedOrganisationId}/customers/${order.customerId}/lat`),
				newLocation!.latitude
			);
			set(
				ref(db, `organisations/${selectedUser.selectedOrganisationId}/customers/${order.customerId}/lng`),
				newLocation!.longitude
			);
			const orderEvent: OrderEventExtended = {
				name: "Location Customer Changed",
				createdAt: new Date().getTime(),
				createdBy: selectedUser.id,
				oldLat: currentOrder.customer.lat,
				oldLng: currentOrder.customer.lng,
				newLat: newLocation!.latitude,
				newLng: newLocation!.longitude,
			};
			const updates: { [key: string]: unknown } = {};
			const nextEventIndex = currentOrder.events ? currentOrder.events.length : 0;
			updates[
				`/organisations/${selectedUser.selectedOrganisationId}/orders/${orderId}/events/${nextEventIndex}`
			] = orderEvent;
			const updateOrder = update(ref(db), updates);

			const newOrder = {
				...currentOrder,
				customer: {
					...currentOrder.customer,
					lat: newLocation!.latitude,
					lng: newLocation!.longitude,
				},
				events: [...currentOrder.events!, orderEvent],
			};

			setOrders([...orders.filter((o) => o.id !== order.id), newOrder]);
			setCurrentOrder(newOrder);
			setMarker(newLocation!);
		} catch (error: any) {
			Alert.alert("Error", error.message);
		}
	};

	useEffect(() => {
		setRefresh(!refresh);
	}, [setOrders]);

	return (
		<View style={{ flex: 1 }}>
			<TouchableOpacity onPress={navigation.goBack} style={tw("absolute right-5 top-5 z-10")}>
				<ThIcon name="close" type="MaterialIcons" />
			</TouchableOpacity>

			<View style={{ marginTop: 10 }}>
				<View style={[tw("py-5 border-b border-gray-300 px-10")]}>
					<Text style={[tw("text-center text-xl font-bold text-gray-600")]}>
						{order.customer.name || "Geen naam"}
					</Text>
					<Text style={[tw("text-center italic text-sm")]}>Code: {order.customer.code || "Geen code"}</Text>
					<View style={tw("flex-row justify-between")}>
						<Pressable
							style={tw("flex-1 mx-3 bg-gray-500 px-5 py-2  my-3 rounded")}
							onPress={() =>
								Linking.openURL(
									`http://maps.google.com/maps?daddr=${order.customer.lat},${order.customer.lng}`
								)
							}
						>
							<Text style={tw("text-white text-center")}>Navigate with Google Maps</Text>
						</Pressable>
						<View style={tw("flex-1 mx-3 ")}>
							{changingLocation ? (
								<View style={tw("flex-row justify-between")}>
									<Pressable
										style={tw("flex-1 bg-green-700 px-5 py-2  my-3 rounded")}
										onPress={() => {
											setChangingLocation(false);
											onChangingLocationSubmit(newMarker);
										}}
									>
										<Text style={tw("text-white text-center")}>Update</Text>
									</Pressable>
									<Pressable
										style={tw("flex-1 ml-3 bg-red-700 px-5 py-2  my-3 rounded")}
										onPress={() => setChangingLocation(false)}
									>
										<Text style={tw("text-white text-center")}>Cancel</Text>
									</Pressable>
								</View>
							) : (
								<Pressable
									style={tw("bg-gray-500 px-5 py-2  my-3 rounded")}
									onPress={() => setChangingLocation(true)}
								>
									<Text style={tw("text-white text-center")}>Change Location</Text>
								</Pressable>
							)}
						</View>
					</View>
				</View>
			</View>
			<View style={{ flex: 1 }}>
				<MapView
					key={refresh.toString()}
					style={StyleSheet.absoluteFillObject}
					provider={PROVIDER_GOOGLE}
					initialRegion={{
						latitude: order.customer.lat,
						longitude: order.customer.lng,
						latitudeDelta: 0.005,
						longitudeDelta: 0.005,
					}}
					ref={mapRef}
					onPress={(e) => {
						if (changingLocation) {
							setNewMarker(e.nativeEvent.coordinate);
						}
					}}
					showsUserLocation={true}
					// style={[tw("w-full"), { flexGrow: 1, height: 400 }]}
				>
					<Marker
						key={order.id}
						coordinate={marker}
						title={order.customer?.name || "Geen naam"}
						description={`${order.status}`}
						identifier="destination"
						onPress={() => setModalVisible(true)}
					>
						<Icon name="map-marker" size={50} color={status.color} />
					</Marker>
					{newMarker && changingLocation && <Marker coordinate={newMarker} />}
				</MapView>
				<Modal
					animationType="slide"
					transparent={true}
					visible={modalVisible}
					onRequestClose={() => {
						setModalVisible(!modalVisible);
					}}
				>
					<Pressable
						style={{
							flex: 1,
							justifyContent: "center",
							alignItems: "center",
							backgroundColor: "rgba(0, 0, 0, 0.5)", // Optional: adds a semi-transparent background
						}}
						onPress={() => {
							setModalVisible(false);
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
							<View style={tw("flex-row justify-between items-center mb-5")}>
								{selectedOrganisation?.settings.statusCategories &&
									selectedOrganisation?.settings.statusCategories.length > 0 &&
									selectedOrganisation?.settings.statusCategories.map((status) => {
										if (
											order?.status &&
											status.name.toLocaleLowerCase() === order.status.toLocaleLowerCase()
										)
											return;
										return (
											<Pressable
												key={status.name}
												onPress={() => {
													setModalVisible(false);
													onMarkerSubmit(status);
												}}
												style={[
													{ backgroundColor: status.color },
													tw("flex-1 rounded py-4 mr-1"),
												]}
											>
												<Text style={tw("text-center text-white")}>{status.name}</Text>
											</Pressable>
										);
									})}
							</View>
							<View style={tw("flex-row justify-between items-center")}>
								<Pressable
									onPress={() => {
										setModalVisible(false);
									}}
									style={tw("flex-1 rounded py-4 ml-1")}
								>
									<Text style={tw("text-center")}>No changes, close window</Text>
								</Pressable>
							</View>
						</View>
					</Pressable>
				</Modal>
			</View>
		</View>
	);
};

export default OrderModalScreen;
