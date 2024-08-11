import { GET_ORDERS_BY_DATE } from "@/graphql/queries";
import { useMutation, useQuery } from "@apollo/client";
import { useAuth, useOrganization } from "@clerk/clerk-expo";
import Icon from "react-native-vector-icons/FontAwesome";

import LoadingScreen from "@/components/LoadingScreen";
import ModalOrderChangeStatus from "@/components/ModalOrderChangeStatus";
import { UPDATE_CUSTOMER, UPDATE_ORDER } from "@/graphql/mutations";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useTailwind } from "tailwind-rn";
declare global {
	interface OrganizationPublicMetadata {
		address: string;
		statusCategories: {
			name: string;
			color: string;
		}[];
		country: string;
		lat: number;
		lng: number;
	}
}
function Page() {
	const tw = useTailwind();
	const navigation = useNavigation();
	const mapRef = useRef<MapView>(null);

	const { customerId, dateString } = useLocalSearchParams();
	const { organization } = useOrganization();
	const { userId } = useAuth();

	if (!organization) {
		return null;
	}

	const {
		data: orders,
		loading: loadingOrders,
		error,
		refetch: refetchOrders,
	} = useQuery(GET_ORDERS_BY_DATE, {
		variables: {
			date: dateString,
		},
	});

	const customerOrders: CustomerOrders = orders.find(
		(order: CustomerOrders) => order.customerId === (customerId as string)
	);

	const { lat, lng } = organization.publicMetadata;
	const { statusCategories } = organization.publicMetadata;

	const coordinates = {
		latitude: Number(customerOrders?.customer.lat) !== 0 ? Number(customerOrders.customer.lat) : Number(lat),
		longitude: Number(customerOrders?.customer.lng) !== 0 ? Number(customerOrders?.customer.lng) : Number(lng),
	};

	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: customerOrders?.customer.name || "Customer",
		});
	}, [navigation, customerOrders]);

	const [loading, setLoading] = useState<boolean>(false);
	const [changingLocation, setChangingLocation] = useState(false);
	const [newMarker, setNewMarker] = useState<{ latitude: number; longitude: number } | null>(null);

	const [UpdateOrder] = useMutation(UPDATE_ORDER);
	const [UpdateCustomer] = useMutation(UPDATE_CUSTOMER);

	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const [relatedOrders, setRelatedOrders] = useState<OrderExtended[]>([]);

	useEffect(() => {
		if (orders) {
			setRelatedOrders(
				orders.filter((order: OrderExtended) => order.customerId === customerOrders.customerId) || []
			);
		}
	}, [orders]);

	async function onMarkerSubmit(status: StatusCategory) {
		if (customerOrders) {
			setLoading(true);
			try {
				for (const order of relatedOrders) {
					await UpdateOrder({
						variables: {
							id: order.id,
							modifiedBy: userId!,
							modifiedAt: Number(new Date()),
							status: status.name,
						},
						refetchQueries: [GET_ORDERS_BY_DATE],
						awaitRefetchQueries: true,
						update: (cache) => {
							// Handmatig de cache bijwerken als dat nodig is
							const existingOrders: OrderExtended[] =
								cache.readQuery({ query: GET_ORDERS_BY_DATE }) || [];
							if (existingOrders) {
								const newOrders = existingOrders.map((existingOrder) =>
									existingOrder.id === order.id
										? {
												...existingOrder,
												modifiedBy: userId!,
												modifiedAt: Number(new Date()),
												status: status.name,
										  }
										: existingOrder
								);
								cache.writeQuery({
									query: GET_ORDERS_BY_DATE,
									data: { orders: newOrders },
								});
							}
						},
					});
				}
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		}
		setModalVisible(false);
	}

	async function onChangingLocationSubmit(newLocation: { latitude: number; longitude: number } | null) {
		setLoading(true);
		try {
			if (newLocation) {
				await UpdateCustomer({
					variables: {
						id: customerOrders.customerId,
						lat: newLocation.latitude,
						lng: newLocation.longitude,
					},
					refetchQueries: [GET_ORDERS_BY_DATE],
					awaitRefetchQueries: true,
					update: (cache) => {
						// Handmatig de cache bijwerken als dat nodig is
						const existingOrders: OrderExtended[] = cache.readQuery({ query: GET_ORDERS_BY_DATE }) || [];
						if (existingOrders) {
							const newOrders = existingOrders.map((existingOrder) =>
								existingOrder.customerId === customerOrders.customerId
									? {
											...existingOrder,
											customer: {
												...existingOrder.customer,
												lat: newLocation.latitude,
												lng: newLocation.longitude,
											},
									  }
									: existingOrder
							);
							cache.writeQuery({
								query: GET_ORDERS_BY_DATE,
								data: { orders: newOrders },
							});
						}
					},
				});
				setNewMarker(null);
				setChangingLocation(false);
			}
		} catch (error: any) {
			console.error(error);
		}
		setLoading(false);
	}

	const [currentStatus, setCurrentStatus] = useState({ name: "Unknown", color: "#000000" });

	useEffect(() => {
		if (statusCategories && customerOrders) {
			setCurrentStatus(
				statusCategories.find(
					(status) =>
						customerOrders.status &&
						status.name.toLocaleLowerCase() === customerOrders.status.toLocaleLowerCase()
				) || currentStatus
			);
		}
	}, [orders]);

	useEffect(() => {
		setLoading(loadingOrders);
	}, [loadingOrders]);

	const handleRefresh = async () => {
		setLoading(true);
		try {
			await refetchOrders({
				fetchPolicy: "network-only",
			});
			await new Promise((resolve) => setTimeout(resolve, 2000));
		} catch (error) {
			console.error(error);
		}
		setLoading(false);
	};
	const [mapType, setMapType] = useState<MapTypes>("hybrid");

	return (
		<SafeAreaView>
			<ScrollView>
				<LoadingScreen loading={loading || loadingOrders} />
				<View style={tw("")}>
					{error ? (
						<Text style={tw("text-red-700")}>Error: {error?.message}</Text>
					) : customerOrders ? (
						<View>
							<View style={[tw(`relative`), { height: 400, width: 400 }]}>
								<MapView
									style={StyleSheet.absoluteFillObject}
									initialRegion={{
										latitude: coordinates.latitude,
										longitude: coordinates.longitude,
										latitudeDelta: 0.2,
										longitudeDelta: 0.2,
									}}
									ref={mapRef}
									onPress={(e) => {
										if (changingLocation) {
											setNewMarker(e.nativeEvent.coordinate);
										}
									}}
									mapType={mapType}
									showsUserLocation={true}
								>
									<Marker
										key={customerOrders.id}
										coordinate={{
											latitude: customerOrders.customer.lat,
											longitude: customerOrders.customer.lng,
										}}
										identifier="destination"
										onPress={() => setModalVisible(true)}
									>
										<Icon name="map-marker" size={50} color={currentStatus.color} />
									</Marker>
									{newMarker && changingLocation && <Marker coordinate={newMarker} />}
								</MapView>
								<ModalOrderChangeStatus
									selectedCustomerOrders={customerOrders}
									modalVisible={modalVisible}
									setModalVisible={setModalVisible}
									onMarkerSubmit={onMarkerSubmit}
								/>
							</View>
							<Pressable
								style={tw("flex-1 mx-3 bg-gray-500 px-5 py-2  my-3 rounded")}
								onPress={() =>
									Linking.openURL(
										`http://maps.google.com/maps?daddr=${customerOrders.customer.lat},${customerOrders.customer.lng}`
									)
								}
							>
								<Text style={tw("text-white text-center")}>Navigate with Google Maps</Text>
							</Pressable>
							<View style={tw("flex-row justify-between")}>
								<Pressable
									style={tw("flex-1 mx-3 bg-gray-500 px-5 py-2  my-3 rounded")}
									onPress={() => {
										setMapType(mapType === "standard" ? "hybrid" : "standard");
									}}
								>
									<Text style={tw("text-white text-center")}>Change Map View</Text>
								</Pressable>
								<Pressable
									style={tw("flex-1 mx-3 bg-gray-500 px-5 py-2  my-3 rounded")}
									onPress={handleRefresh}
								>
									<Text style={tw("text-white text-center")}>Refresh</Text>
								</Pressable>
							</View>
							<View style={tw("px-3")}>
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
							{relatedOrders &&
								relatedOrders.map((order: OrderExtended) => (
									<View key={order.id} style={tw("bg-gray-100 p-3 my-3")}>
										<Text>Order ID: {order.orderNumber ? order.orderNumber : order.id}</Text>
										<Text>Status: {order.status}</Text>
									</View>
								))}
						</View>
					) : (
						<Text>No order found.</Text>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

export default Page;
