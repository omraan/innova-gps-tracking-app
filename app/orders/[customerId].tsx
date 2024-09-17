import { GET_ORDERS_BY_DATE } from "@/graphql/queries";
import { useMutation, useQuery } from "@apollo/client";
import { useAuth, useOrganization, useUser } from "@clerk/clerk-expo";
import Icon from "react-native-vector-icons/FontAwesome";
import IonIcon from "react-native-vector-icons/Ionicons";
import McIcon from "react-native-vector-icons/MaterialCommunityIcons";

import LoadingScreen from "@/components/LoadingScreen";
import LocationInput from "@/components/LocationInput";
import ModalOrderChangeStatus from "@/components/ModalOrderChangeStatus";
import { UPDATE_CUSTOMER, UPDATE_ORDER } from "@/graphql/mutations";
import { getRelatedOrders } from "@/lib/getRelatedOrders";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
	Dimensions,
	KeyboardAvoidingView,
	Linking,
	Platform,
	Pressable,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
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
	const { customerId, selectedDate } = useLocalSearchParams();

	const {
		data: dataOrders,
		loading: loadingOrders,
		error,
		refetch: refetchOrders,
	} = useQuery(GET_ORDERS_BY_DATE, {
		variables: {
			date: selectedDate,
		},
	});
	const orders = dataOrders?.getOrdersByDate || [];

	const { organization } = useOrganization();

	if (!organization) {
		return null;
	}

	const tw = useTailwind();
	const navigation = useNavigation();
	const mapRef = useRef<MapView>(null);
	const { user } = useUser();
	const { userId, orgId, orgRole: authRole } = useAuth();
	const [mapType, setMapType] = useState<MapTypes>("standard");
	useEffect(() => {
		if (user) {
			setMapType(user.unsafeMetadata.defaultMapView as MapTypes);
		}
	}, [user]);

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
	const [relatedOrders, setRelatedOrders] = useState<{ name: string; value: OrderExtended }[]>([]);

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
						date: selectedDate,
						modifiedBy: userId!,
						modifiedAt: Number(new Date()),
						status: status.name,
					};

					if (notes && notes !== "") {
						variables.notes = notes;
					}
					UpdateOrder({
						variables: {
							id: order.name,
							...variables,
						},
						onCompleted: () => setLoading(false),
						update: (cache) => {
							// Handmatig de cache bijwerken als dat nodig is
							const existingOrders = cache.readQuery<{
								getOrdersByDate: { name: string; value: OrderExtended }[];
							}>({
								query: GET_ORDERS_BY_DATE,
								variables: {
									date: selectedDate,
								},
							})?.getOrdersByDate;

							if (existingOrders) {
								const newOrders = existingOrders.map((existingOrder) => {
									if (existingOrder.name === order.name) {
										const newOrder = {
											name: existingOrder.name,
											value: {
												...existingOrder.value,
												modifiedBy: userId!,
												modifiedAt: Number(new Date()),
												status: status.name,
												events: [
													...existingOrder.value.events!,
													{
														name: "",
														createdBy: "",
														createdAt: "",
														status: status.name,
														modifiedAt: Number(new Date()),
													},
												],
											},
										};
										return newOrder;
									}
									return existingOrder;
								});
								cache.writeQuery({
									query: GET_ORDERS_BY_DATE,
									variables: {
										date: selectedDate,
									},
									data: { getOrdersByDate: newOrders },
								});
							}
						},
					});
				}
			} catch (error) {
				console.error(error);
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
						lastCoordinateUpdate: Number(new Date()),
					},
					onCompleted: () => setLoading(false),
					update: (cache) => {
						// Handmatig de cache bijwerken als dat nodig is
						const existingOrders = cache.readQuery<{
							getOrdersByDate: { name: string; value: OrderExtended }[];
						}>({
							query: GET_ORDERS_BY_DATE,
							variables: {
								date: selectedDate,
							},
						})?.getOrdersByDate;

						if (existingOrders) {
							const newOrders = existingOrders.map((existingOrder) =>
								existingOrder.value.customerId === customerOrders.customerId
									? {
											name: existingOrder.name,
											value: {
												...existingOrder.value,
												customer: {
													...existingOrder.value.customer,
													lat: newLocation.latitude,
													lng: newLocation.longitude,
												},
												events: [
													...existingOrder.value.events!,
													{
														name: "",
														createdAt: "",
														createdBy: "",
														lat: newLocation.latitude,
														lng: newLocation.longitude,
														modifiedAt: Number(new Date()),
													},
												],
											},
									  }
									: existingOrder
							);
							cache.writeQuery({
								query: GET_ORDERS_BY_DATE,
								variables: {
									date: selectedDate,
								},
								data: { getOrdersByDate: newOrders },
							});
						}
					},
				});
				setNewMarker(null);
				setChangingLocation(false);
			} else {
				setLoading(false);
			}
		} catch (error: any) {
			console.error(error);
		}
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
			setRelatedOrders(
				orders.filter(
					(order: { name: string; value: OrderExtended }) => order.value.customerId === customerId
				) || []
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
	const [orgRole, setOrgRole] = useState<string | undefined>();

	useEffect(() => {
		const metaDataLabels = user?.publicMetadata as UserPublicMetadata;
		if (authRole === "org:admin") {
			setOrgRole("org:admin");
		} else {
			if (
				orgId &&
				metaDataLabels &&
				metaDataLabels.organizations &&
				metaDataLabels.organizations[orgId]?.orgRole
			) {
				setOrgRole(metaDataLabels.organizations[orgId].orgRole);
			}
		}
	}, [user?.publicMetadata, orgId]);
	return (
		<SafeAreaView style={{ flex: 1 }}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
				style={{ flex: 1 }}
			>
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
									<View style={tw("flex flex-row flex-wrap justify-end items-end")}>
										<Pressable
											style={tw("mx-3 bg-gray-500 px-5 py-2  my-3 rounded")}
											onPress={handleRefresh}
										>
											<IonIcon name="refresh" size={20} color="white" />
										</Pressable>
										<Pressable
											style={tw("mx-3 bg-gray-500 px-5 py-2  my-3 rounded")}
											onPress={() => {
												setMapType(mapType === "standard" ? "hybrid" : "standard");
											}}
										>
											<McIcon name="layers-outline" size={20} color="white" />
										</Pressable>
									</View>
								</View>

								<View style={[tw("lg:w-[40%]"), { height: safeAreaHeight }]}>
									<View style={tw("px-3")}>
										{customerOrders &&
										customerOrders.customer.lat &&
										customerOrders.customer.lat != 0 ? (
											<Pressable
												onPress={() =>
													Linking.openURL(
														`http://maps.google.com/maps?daddr=${customerOrders.customer.lat},${customerOrders.customer.lng}`
													)
												}
											>
												<View
													style={tw(
														"bg-gray-500 h-10 items-center flex-row justify-center my-3 rounded w-full"
													)}
												>
													<Text style={tw("text-white text-center text-xs")}>
														Navigate with Google Maps
													</Text>
												</View>
											</Pressable>
										) : (
											<></>
										)}
									</View>
									{orgRole && orgRole !== "org:viewer" && (
										<View style={tw("px-3 mb-5 ")}>
											{changingLocation ? (
												<View>
													<View style={tw("flex-row")}>
														<Pressable
															style={tw("flex-1 mr-3")}
															onPress={() => {
																setChangingLocation(false);
																onChangingLocationSubmit(newMarker);
															}}
														>
															<View
																style={tw(
																	"bg-green-700 px-5 py-2 h-10 my-3 rounded flex justify-center items-center"
																)}
															>
																<Text style={tw("text-white text-center")}>Update</Text>
															</View>
														</Pressable>
														<Pressable
															style={tw("flex-1 ml-3")}
															onPress={() => setChangingLocation(false)}
														>
															<View
																style={tw(
																	"bg-red-700 h-10 flex justify-center items-center my-3 rounded"
																)}
															>
																<Text style={tw("text-white text-center")}>Cancel</Text>
															</View>
														</Pressable>
													</View>
													<LocationInput
														setChangingLocation={setChangingLocation}
														onChangingLocationSubmit={onChangingLocationSubmit}
													/>
												</View>
											) : (
												<Pressable
													style={tw(
														"bg-gray-500 h-10 items-center flex-row justify-center my-3 rounded"
													)}
													onPress={() => setChangingLocation(true)}
												>
													<Text style={tw("text-white text-center")}>Change Location</Text>
												</Pressable>
											)}
										</View>
									)}

									<View style={tw("md:flex-row lg:flex-col")}>
										<View style={tw("md:flex-1 lg:flex-initial px-3 mb-5")}>
											<View style={tw("bg-gray-200 border border-gray-300 rounded px-3")}>
												{customerOrders && (
													<View style={tw("px-2 py-4")}>
														<Text style={tw("mb-3 font-semibold")}>
															{customerOrders.customer.name}
														</Text>
														<Text>
															{customerOrders.customer.streetName}{" "}
															{customerOrders.customer.streetNumber}
														</Text>
														{customerOrders.customer.email ? (
															<Text>{customerOrders.customer.email}</Text>
														) : (
															<></>
														)}
														{customerOrders.customer.phoneNumber ? (
															<Text>{customerOrders.customer.phoneNumber}</Text>
														) : (
															<></>
														)}
														{customerOrders.customer.phoneNumber2 ? (
															<Text>{customerOrders.customer.phoneNumber2}</Text>
														) : (
															<></>
														)}
														{customerOrders.customer.phoneNumber3 ? (
															<Text>{customerOrders.customer.phoneNumber3}</Text>
														) : (
															<></>
														)}
														{customerOrders.notes ? (
															<Text>{customerOrders.notes}</Text>
														) : (
															<></>
														)}

														{customerOrders.customer.lat ? (
															<View>
																<Text style={tw("mt-2")}>
																	Latitude: {customerOrders.customer.lat}
																</Text>
																<Text style={tw("")}>
																	Longitude: {customerOrders.customer.lng}
																</Text>
															</View>
														) : (
															<></>
														)}
													</View>
												)}
											</View>
										</View>

										<View style={tw("md:flex-1 lg:flex-initial px-3")}>
											{customerOrders.notes || customerOrders.customer.notes ? (
												<View
													style={tw(
														"mb-5 bg-gray-200 border border-gray-300 rounded px-5 py-3"
													)}
												>
													<Text style={tw("text-left text-sm mb-3 font-bold")}>Notes</Text>
													<Text
														style={tw(
															`text-left max-w-[300px] flex flex-wrap ${
																customerOrders.notes ? "mb-5" : "mb-0"
															}`
														)}
													>
														{customerOrders.customer.notes}
													</Text>
													<Text style={tw("text-left max-w-[300px] flex flex-wrap")}>
														{customerOrders.notes}
													</Text>
												</View>
											) : (
												<View></View>
											)}
											<View style={tw("bg-gray-200 border border-gray-300 rounded px-3")}>
												{relatedOrders &&
													relatedOrders.map(
														(
															order: { name: string; value: OrderExtended },
															index: number
														) => (
															<View
																key={index}
																style={tw(
																	"px-2 py-4 flex-row justify-between items-center"
																)}
															>
																<Text style={tw("")}>
																	Order number:{" "}
																	{order.value.orderNumber && (
																		<Text style={tw("font-bold")}>
																			{order.value.orderNumber}
																		</Text>
																	)}
																</Text>
																<View
																	style={tw(
																		"bg-black/80 text-white px-3 py-2 rounded"
																	)}
																>
																	<Text style={tw("text-white")}>
																		{order.value.status}
																	</Text>
																</View>
															</View>
														)
													)}
											</View>
										</View>
									</View>
								</View>
							</View>
						) : (
							<Text>No order found.</Text>
						)}
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

export default Page;
