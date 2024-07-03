import RNDateTimePicker from "@react-native-community/datetimepicker";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Dimensions, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import RNPickerSelect from "react-native-picker-select";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTailwind } from "tailwind-rn";
import OrderCard from "../components/OrderCard";
import { useOrderStore } from "../hooks/stores/orderStore";
import { useOrganisationStore } from "../hooks/stores/organisationStore";
import { useUserStore } from "../hooks/stores/userStore";
import { pickerSelectStyles } from "../lib/styles";
import { RootStackParamList } from "../navigator/RootNavigator";
import { TabStackParamList } from "../navigator/TabNavigator";

import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from "date-fns";
import * as Location from "expo-location";
import { push, ref, set, update } from "firebase/database";
import Icon from "react-native-vector-icons/FontAwesome";
import { db } from "../firebase";

export type OrdersScreenNavigationProp = CompositeNavigationProp<
	BottomTabNavigationProp<TabStackParamList, "Orders">,
	NativeStackNavigationProp<RootStackParamList>
>;
const OrdersScreen = () => {
	const tw = useTailwind();
	const navigation = useNavigation<OrdersScreenNavigationProp>();
	// const { loading, error, data } = useQuery(GET_ORDERS);
	const [loading, setLoading] = useState(true);
	const { orders, setOrders, initOrders } = useOrderStore();
	const { selectedUser } = useUserStore();
	const { selectedOrganisation } = useOrganisationStore();

	const [selectedDate, setSelectedDate] = useState(new Date());
	const [dateRange, setDateRange] = useState<String>("Day");
	const mapRef = useRef<MapView>(null);
	const insets = useSafeAreaInsets();
	const safeAreaHeight = Dimensions.get("window").height - insets.top - insets.bottom - 25;

	const [filteredOrders, setFilteredOrders] = useState<OrderExtended[]>([]);

	const [modalVisible, setModalVisible] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<OrderExtended | null>(null);
	const [refresh, setRefresh] = useState(false);
	useEffect(() => {
		if (orders.length > 0 && selectedUser?.selectedOrganisationId && selectedOrganisation?.id) {
			setLoading(false);
			setRefresh(!refresh);
		}
	}, [orders, selectedUser, selectedOrganisation]);

	useEffect(() => {
		const filtered = orders.filter((order) => {
			const orderDate = new Date(Number(order.expectedDeliveryDate));
			switch (dateRange) {
				case "Day":
					return format(orderDate, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
				case "Week":
					return orderDate >= startOfWeek(selectedDate) && orderDate <= endOfWeek(selectedDate);
				case "Month":
					return orderDate >= startOfMonth(selectedDate) && orderDate <= endOfMonth(selectedDate);
				default:
					return false;
			}
		});
		setFilteredOrders(filtered);
	}, [refresh]);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: false,
		});
	}, []);

	const [showPicker, setShowPicker] = useState(false);
	const onChange = (event: any, selectedDate: any) => {
		const currentDate = selectedDate || selectedDate;
		setShowPicker(false);
		setSelectedDate(currentDate);
		setRefresh(!refresh);
	};

	const [currentLocation, setCurrentLocation] = useState<[number, number]>([0, 0]);
	const pickerRef = useRef<any>(null);
	const getLocation = async () => {
		let { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== "granted") {
			console.error("Permission to access location was denied");
			return;
		}

		let location = await Location.getCurrentPositionAsync({});
		setCurrentLocation([location.coords.latitude, location.coords.longitude]);
	};

	useEffect(() => {
		initOrders();
		getLocation();
	}, []);

	const onMarkerSubmit = (newStatus: string) => {
		const newDate = new Date();
		if (!selectedOrder || !selectedOrder.customer || !selectedUser) {
			// Handle the case where selectedOrder or selectedOrder.customer is undefined
			console.error("selectedOrder or selectedOrder.customer is undefined");
			return;
		}

		set(
			ref(db, `organisations/${selectedUser.selectedOrganisationId}/orders/${selectedOrder?.id}/status`),
			newStatus
		).then(() => {
			setOrders([
				...orders.filter((order) => order.id !== selectedOrder.id),
				{ ...selectedOrder, status: newStatus },
			]);
			setRefresh(!refresh);
		});

		const updates: { [key: string]: unknown } = {};
		const nextEventIndex = selectedOrder.events ? selectedOrder.events.length : 0;

		const orderEvent: OrderEvent = {
			name: "Order changed",
			createdAt: new Date().getTime(),
			createdBy: selectedUser.id,
			status: newStatus,
		};
		updates[
			`/organisations/${selectedUser.selectedOrganisationId}/orders/${selectedOrder?.id}/events/${nextEventIndex}`
		] = orderEvent;

		const updateOrder = update(ref(db), updates);
	};

	return (
		<LinearGradient
			style={tw("h-full")}
			colors={["rgba(99, 102, 241, 1)", "rgba(99, 102, 241, 0.4)"]}
			start={[0, 0]}
			end={[1, 1]}
		>
			<ScrollView>
				<SafeAreaView>
					<View style={tw("flex-row")}>
						<View style={[tw(`p-5 w-[40%] lg:w-[30%]`), { height: safeAreaHeight }]}>
							<View>
								<View style={tw("bg-white p-5 flex-row justify-between items-center rounded mb-3")}>
									<Pressable onPress={() => setShowPicker(true)}>
										<Text style={tw("bg-white text-gray-500")}>{selectedDate.toDateString()}</Text>
									</Pressable>
									{showPicker && (
										<RNDateTimePicker
											display="compact"
											value={selectedDate}
											mode="date"
											onChange={onChange}
										/>
									)}

									<RNPickerSelect
										ref={pickerRef}
										onValueChange={(value) => {
											setDateRange(value);
											setRefresh(!refresh);
										}}
										items={[
											{ label: "Day", value: "Day" },
											{ label: "Week", value: "Week" },
											{ label: "Month", value: "Month" },
										]}
										style={{ ...pickerSelectStyles }}
										useNativeAndroidPickerStyle={false}
										value={dateRange}
										fixAndroidTouchableBug={true}
									/>
								</View>
							</View>
							{!loading &&
								filteredOrders.map((order: OrderExtended) => (
									<OrderCard order={order} key={order.id} orderId={order.id} />
								))}
						</View>

						<View style={[tw(`flex-1 bg-white`), { height: safeAreaHeight }]}>
							{selectedOrganisation?.settings.lat &&
								selectedOrganisation?.settings.lng &&
								currentLocation[0] > 0 && (
									<MapView
										key={refresh.toString()}
										style={StyleSheet.absoluteFillObject}
										provider={PROVIDER_GOOGLE}
										initialRegion={{
											latitude: selectedOrganisation.settings.lat,
											longitude: selectedOrganisation.settings.lng,
											latitudeDelta: 0.2,
											longitudeDelta: 0.2,
										}}
										ref={mapRef}
										showsUserLocation={true}
									>
										{filteredOrders && filteredOrders.length > 0 && currentLocation[0] > 0 && (
											<MapViewDirections
												origin={{
													latitude: currentLocation[0],
													longitude: currentLocation[1],
												}}
												// origin={{ latitude: 12.50500585, longitude: -69.99310453 }}
												waypoints={
													filteredOrders.map((order: OrderExtended) => {
														return {
															latitude: order.customer?.lat || 0,
															longitude: order.customer?.lng || 0,
														};
													}) || []
												}
												destination={{
													latitude: filteredOrders[0].customer?.lat || 0,
													longitude: filteredOrders[0].customer?.lng || 0,
												}}
												optimizeWaypoints={true}
												apikey="AIzaSyCsuRE5SM_yBawBZKVQxA9_9B6dTdFB2lQ"
												strokeWidth={3}
												strokeColor="gray"
											/>
										)}

										{filteredOrders.map((order: OrderExtended) => {
											const pinColor =
												selectedOrganisation.settings.statusCategories.find(
													(status) =>
														order.status &&
														status.name.toLocaleLowerCase() ===
															order.status.toLocaleLowerCase()
												)?.color || "#000000";

											return (
												<Marker
													key={order.id}
													coordinate={{
														latitude: order.customer?.lat || 0,
														longitude: order.customer?.lng || 0,
													}}
													title={order.customer?.name || "Geen naam"}
													description={`${order.status}`}
													identifier="destination"
													onPress={() => {
														setSelectedOrder(order);
														setModalVisible(true);
													}}
												>
													<Icon name="map-marker" size={35} color={pinColor} />
												</Marker>
											);
										})}
									</MapView>
								)}
						</View>
					</View>
				</SafeAreaView>
			</ScrollView>
			<Modal
				animationType="none"
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => {
					setModalVisible(!modalVisible);
				}}
			>
				<Pressable
					style={[
						{
							flex: 1,
							justifyContent: "center",
							alignItems: "center",
							backgroundColor: "rgba(0, 0, 0, 0.5)", // Optional: adds a semi-transparent background
						},
					]}
					onPress={() => {
						setModalVisible(false);
					}}
				>
					<View
						style={[
							{
								backgroundColor: "white",
								padding: 35,
								alignItems: "center",
								shadowColor: "#000",
								shadowOffset: { width: 0, height: 2 },
								shadowOpacity: 0.25,
								shadowRadius: 4,
								elevation: 5,
							},
							tw("max-w-[50%] mx-auto"),
						]}
					>
						<Text style={tw("text-center mb-4")}>
							Do you want to change the status of this order for {selectedOrder?.customer.name}?
						</Text>

						<View style={tw("flex-row justify-between items-center mb-5")}>
							{selectedOrganisation?.settings.statusCategories &&
								selectedOrganisation?.settings.statusCategories.length > 0 &&
								selectedOrganisation?.settings.statusCategories.map((status) => {
									if (
										selectedOrder?.status &&
										status.name.toLocaleLowerCase() === selectedOrder.status.toLocaleLowerCase()
									)
										return;
									return (
										<Pressable
											key={status.name}
											onPress={() => {
												setModalVisible(false);
												onMarkerSubmit(status.name);
											}}
											style={[{ backgroundColor: status.color }, tw("flex-1 rounded py-4 mr-1")]}
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
		</LinearGradient>
	);
};

export default OrdersScreen;
