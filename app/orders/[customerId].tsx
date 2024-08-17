import { GET_ORDERS_BY_DATE } from "@/graphql/queries";
import { useMutation, useQuery } from "@apollo/client";
import { useAuth, useOrganization } from "@clerk/clerk-expo";
import Icon from "react-native-vector-icons/FontAwesome";

import LoadingScreen from "@/components/LoadingScreen";
import ModalOrderChangeStatus from "@/components/ModalOrderChangeStatus";
import { UPDATE_CUSTOMER, UPDATE_ORDER } from "@/graphql/mutations";
import { getRelatedOrders } from "@/lib/getRelatedOrders";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Dimensions, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTailwind } from "tailwind-rn";
declare global {
	interface OrganizationPublicMetadata {
		address: string;
		statusCategories: {
			name: string;
			color: string;
		}[];
		orderCategories: {
			name: string;
			color: string;
		}[];

		country: string;
		lat: number;
		lng: number;
	}
}
function Page() {
	const { customerId, dateString } = useLocalSearchParams();

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

	const { organization } = useOrganization();

	if (!organization) {
		return null;
	}

	const tw = useTailwind();
	const navigation = useNavigation();
	const mapRef = useRef<MapView>(null);

	const { userId } = useAuth();
	const [mapType, setMapType] = useState<MapTypes>("hybrid");

	const [customerOrders, setCustomerOrders] = useState<CustomerOrders>();

	useEffect(() => {
		if (orders) {
			const relatedOrders = getRelatedOrders(orders).filter(
				(order: CustomerOrders) => order.customerId === customerId
			)[0];
			setCustomerOrders(relatedOrders);
		}
	}, [orders]);

	const { lat, lng } = organization.publicMetadata;
	const { statusCategories } = organization.publicMetadata;

	const [loading, setLoading] = useState<boolean>(false);
	const [changingLocation, setChangingLocation] = useState(false);
	const [newMarker, setNewMarker] = useState<{ latitude: number; longitude: number } | null>(null);

	const [UpdateOrder] = useMutation(UPDATE_ORDER);
	const [UpdateCustomer] = useMutation(UPDATE_CUSTOMER);

	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const [relatedOrders, setRelatedOrders] = useState<OrderExtended[]>([]);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: customerOrders?.customer?.name || "Customer",
		});
	}, [navigation, customerOrders]);

	async function onMarkerSubmit(status: StatusCategory, notes?: string) {
		if (customerOrders) {
			setLoading(true);
			try {
				for (const order of relatedOrders) {
					const variables: any = {
						modifiedBy: userId!,
						modifiedAt: Number(new Date()),
						status: status.name,
					};

					if (notes && notes !== "") {
						variables.notes = notes;
					}
					UpdateOrder({
						variables: {
							id: order.id,
							...variables,
						},
						update: (cache, { data }) => {
							console.log("Data >>>", data);
							// Handmatig de cache bijwerken als dat nodig is
							const existingOrders: OrderExtended[] =
								cache.readQuery({ query: GET_ORDERS_BY_DATE }) || [];
							if (existingOrders) {
								const newOrders = existingOrders.map((existingOrder) =>
									existingOrder.id === order.id
										? {
												...existingOrder,
												...variables,
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
			if (newLocation && customerOrders) {
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
								existingOrder.customerId === customerOrders?.customerId
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
		if (customerOrders && statusCategories) {
			setCurrentStatus(
				statusCategories.find(
					(status) =>
						customerOrders.status &&
						status.name.toLocaleLowerCase() === customerOrders.status.toLocaleLowerCase()
				) || currentStatus
			);
		}
	}, [customerOrders]);

	useEffect(() => {
		if (orders) {
			setRelatedOrders(orders.filter((order: OrderExtended) => order.customerId === customerId) || []);
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
	const coordinates = {
		latitude: Number(customerOrders?.customer.lat) !== 0 ? Number(customerOrders?.customer.lat) : Number(lat),
		longitude: Number(customerOrders?.customer.lng) !== 0 ? Number(customerOrders?.customer.lng) : Number(lng),
	};

	const { width, height } = Dimensions.get("window");
	const isLandscape = width > height;
	const isTablet = width >= 768; // Aanname voor tablet breedte

	const containerStyle = [
		isLandscape && isTablet ? { width: width * 0.6, height } : isTablet ? { height: 500 } : { height: 300 },
	];
	const insets = useSafeAreaInsets();
	const safeAreaHeight = Dimensions.get("window").height - insets.top - insets.bottom - 25;

	return (
		<SafeAreaView>
			<ScrollView>
				<LoadingScreen loading={loading || loadingOrders} />
				<View style={tw("")}>
					{error ? (
						<Text style={tw("text-red-700")}>Error: {error?.message}</Text>
					) : customerOrders ? (
						<View style={tw("lg:flex-row")}>
							<View style={containerStyle}>
								<MapView
									style={StyleSheet.absoluteFillObject}
									initialRegion={{
										latitude: coordinates.latitude,
										longitude: coordinates.longitude,
										latitudeDelta: 0.2,
										longitudeDelta: 0.2,
									}}
									provider={PROVIDER_GOOGLE}
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
							<View style={[tw("lg:w-[40%] "), { height: safeAreaHeight }]}>
								<Pressable
									style={tw("")}
									onPress={() =>
										Linking.openURL(
											`http://maps.google.com/maps?daddr=${customerOrders.customer.lat},${customerOrders.customer.lng}`
										)
									}
								>
									<View style={tw("mx-3 bg-gray-500 px-5 py-2  my-3 rounded")}>
										<Text style={tw("text-white text-center")}>Navigate with Google Maps</Text>
									</View>
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
