import LoadingScreen from "@/components/LoadingScreen";
import MapOrders from "@/components/MapOrders";
import ModalOrderChangeStatus from "@/components/ModalOrderChangeStatus";
import { ModalPicker } from "@/components/ModalPicker";
import OrderList from "@/components/OrderList";
import { UPDATE_ORDER } from "@/graphql/mutations";
import { GET_ORDERS_BY_DATE, GET_VEHICLES } from "@/graphql/queries";
import { getRelatedOrders } from "@/lib/getRelatedOrders";
import { useMutation, useQuery } from "@apollo/client";
import { SignedIn, useAuth, useOrganization, useUser } from "@clerk/clerk-expo";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import haversine from "haversine-distance";
import moment from "moment-timezone";
import React, { useEffect, useState } from "react";
import {
	Button,
	Dimensions,
	Platform,
	Pressable,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTailwind } from "tailwind-rn";

export default function Page() {
	const tw = useTailwind();
	const { organization } = useOrganization();
	const { user } = useUser();
	const { userId, orgId, orgRole: authRole } = useAuth();

	const currentDate = new Date();

	const [date, setDate] = useState<string>(moment(currentDate).format("yyyy-MM-DD"));

	const [input, setInput] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [modalVisible, setModalVisible] = useState<boolean>(false);

	const [customerOrders, setCustomerOrders] = useState<CustomerOrders[] | undefined>(undefined);
	const [filteredOrders, setFilteredOrders] = useState<CustomerOrders[]>([]);

	const [selectedVehicle, setSelectedVehicle] = useState<{ name: string; value: Vehicle } | undefined>(undefined);
	const [selectedCustomerOrders, setSelectedCustomerOrders] = useState<CustomerOrders | undefined>(undefined);

	const {
		data: dataOrders,
		loading: loadingOrders,
		error,
		refetch: refetchOrders,
	} = useQuery(GET_ORDERS_BY_DATE, {
		variables: {
			date,
		},
		fetchPolicy: "network-only",
	});
	const orders = dataOrders?.getOrdersByDate || [];
	const { data: dataVehicles, refetch: refetchVehicles } = useQuery(GET_VEHICLES);
	const vehicles = dataVehicles?.getVehicles || [];

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

	const [updateOrder] = useMutation(UPDATE_ORDER, {
		onCompleted: () => {},
		onError: (error) => {
			console.error(error);
		},
	});

	useEffect(() => {
		if (orders && orders.length > 0) {
			setCustomerOrders(getRelatedOrders(orders));
			if (liveLocation) {
				setCurrentLocation(liveLocation);
			}
		}
	}, [orders]);

	useEffect(() => {
		Location.requestForegroundPermissionsAsync().then(({ status }) => {
			if (status !== "granted") {
				console.error("Permission to access location was denied");
				return;
			}
			Location.getCurrentPositionAsync({}).then(({ coords }) => {
				setCurrentLocation([coords.latitude, coords.longitude]);
			});
		});
	}, []);

	useEffect(() => {
		if (orgId && user) {
			const metaData = user?.unsafeMetadata?.organizations?.[orgId];
			if (vehicles?.length > 0 && metaData?.vehicleId) {
				setSelectedVehicle(vehicles.find((v: Vehicle) => v.name === metaData.vehicleId));
			}
		}
	}, [vehicles, user, orgId]);

	useEffect(() => {
		try {
			if (customerOrders) {
				if (selectedVehicle) {
					setFilteredOrders(
						customerOrders.filter((order: CustomerOrders) => order.vehicleId === selectedVehicle.name) || []
					);
				} else {
					setFilteredOrders(customerOrders);
				}
			} else {
				setFilteredOrders([]);
			}
		} catch (error) {
			console.log("Error: ", error);
		}
	}, [date, customerOrders, selectedVehicle]);

	const handlePickerChange = (value: string) => {
		setSelectedVehicle(vehicles.find((v: any) => v.value.licensePlate === value));
	};

	async function onMarkerSubmit(status: StatusCategory, notes?: string) {
		setLoading(true);
		if (selectedCustomerOrders) {
			await selectedCustomerOrders.orderIds.forEach((orderId: string) => {
				const variables: any = {
					id: orderId,
					date,
					modifiedBy: userId!,
					modifiedAt: Number(new Date()),
					status: status.name,
				};

				if (notes && notes !== "") {
					variables.notes = notes;
				}
				updateOrder({
					variables,
					onCompleted: () => {
						setLoading(false);
						setModalVisible(false);
					},
					update: (cache) => {
						// Handmatig de cache bijwerken als dat nodig is
						const existingOrders = cache.readQuery<{
							getOrdersByDate: { name: string; value: OrderExtended }[];
						}>({
							query: GET_ORDERS_BY_DATE,
							variables: {
								date,
							},
						})?.getOrdersByDate;

						if (existingOrders) {
							const newOrders = existingOrders.map((existingOrder) => {
								if (existingOrder.name === orderId) {
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
									date,
								},
								data: { getOrdersByDate: newOrders },
							});
						}
					},
				});
			});
		}
	}

	const filteredOrdersWithInput = filteredOrders.filter((order: CustomerOrders) => {
		if (!input || input !== "") {
			return (
				order.customer.name.toLowerCase().includes(input.toLowerCase()) ||
				order.customer.code.toLowerCase().includes(input.toLowerCase()) ||
				order.customer.streetName?.toLowerCase().includes(input.toLowerCase()) ||
				order.orderNumbers.some((orderNumber: number) => orderNumber.toString().includes(input.toLowerCase()))
			);
		}
	});

	const handleRefresh = async () => {
		setLoading(true);
		try {
			await refetchOrders({
				fetchPolicy: "network-only",
			});
			await refetchVehicles({
				fetchPolicy: "network-only",
			});
			await new Promise((resolve) => setTimeout(resolve, 2000));
		} catch (error) {
			console.error(error);
		}
		setLoading(false);
	};

	const handleSelection = (order: CustomerOrders) => {
		setSelectedCustomerOrders(order);
		setModalVisible(true);
	};
	const { width, height } = Dimensions.get("window");
	const isLandscape = width > height;
	const isTablet = width >= 768; // Aanname voor tablet breedte

	const containerStyle = [
		isLandscape && isTablet ? { width: width * 0.6, height } : isTablet ? { height: 500 } : { height: 300 },
	];
	const insets = useSafeAreaInsets();
	const safeAreaHeight = Dimensions.get("window").height - insets.top - insets.bottom - 25;

	/**  */
	const [currentLocation, setCurrentLocation] = useState<[number, number]>([
		(organization?.publicMetadata.lat as number) || 0,
		(organization?.publicMetadata.lng as number) || 0,
	]);

	const [liveLocation, setLiveLocation] = useState<[number, number]>([
		(organization?.publicMetadata.lat as number) || 0,
		(organization?.publicMetadata.lng as number) || 0,
	]);

	useEffect(() => {
		const watchUserPosition = async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				console.error("Permission to access location was denied");
				return;
			}

			const locationSubscription = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.High,
					timeInterval: 5000, // Update location every 2 seconds
					distanceInterval: 25, // Update location every 1 meters
				},
				(location) => {
					const { latitude, longitude } = location.coords;
					setLiveLocation([latitude, longitude]);
				}
			);

			return () => {
				locationSubscription.remove();
			};
		};

		watchUserPosition();
	}, []);
	const getDistance = (
		location1: { latitude: number; longitude: number },
		location2: { latitude: number; longitude: number }
	) => {
		return haversine(location1, location2);
	};

	const sortedOrders =
		filteredOrders && filteredOrders.length > 0
			? filteredOrders
					.filter((value: CustomerOrders) => value.status !== "Completed" && value.status !== "Failed")
					.map((value: CustomerOrders) => {
						const orderCoords = {
							latitude: value.customer?.lat || 0,
							longitude: value.customer?.lng || 0,
						};
						const distance = getDistance(
							{
								latitude: currentLocation[0],
								longitude: currentLocation[1],
							},
							orderCoords
						);
						return { ...value, distance };
					})
					.sort((a: any, b: any) => a.distance - b.distance)
					.slice(0, 24)
			: [];
	const [ordersIndex, setOrdersIndex] = useState<number[]>([]);
	const [show, setShow] = useState(false);

	const onDateChange = (event: any, selectedDate: any) => {
		const currentDate = selectedDate || date;
		setShow(Platform.OS === "ios");
		setDate(moment(currentDate).format("yyyy-MM-DD"));
	};

	useEffect(() => {
		console.log("dateChange", date);
	}, [date]);

	const showMode = (currentMode: any) => {
		setShow(true);
	};
	/** */
	return (
		<SafeAreaView>
			<LoadingScreen loading={loading ? loading : loadingOrders} />
			<SignedIn>
				<View style={tw("lg:flex-row")}>
					<View style={tw("z-[3]")}>
						<View style={containerStyle}>
							{currentLocation && (
								<MapOrders
									orders={filteredOrdersWithInput}
									sortedOrders={sortedOrders}
									setOrdersIndex={setOrdersIndex}
									currentLocation={currentLocation}
									liveLocation={liveLocation}
									handleRefresh={handleRefresh}
									handleSelection={handleSelection}
									showDirections={selectedVehicle ? true : false}
								/>
							)}
						</View>
					</View>
					<View style={[tw("lg:w-[40%]"), { height: safeAreaHeight }]}>
						<View
							style={[
								tw("lg:fixed z-[2] bg-white"),
								{
									elevation: 2,
									shadowColor: "#000",
									shadowOffset: { width: 0, height: 4 },
									shadowOpacity: 0.2,
									shadowRadius: 5,
								},
							]}
						>
							{orgRole && orgRole !== "org:driver" && (
								<View style={[tw("bg-white rounded px-5 pt-5 pb-2 flex flex-row justify-between")]}>
									{vehicles && vehicles.length > 0 && (
										<View style={tw("min-w-[125px] md:min-w-[200px]")}>
											<ModalPicker
												key={selectedVehicle?.name}
												list={vehicles.map((v: any) => {
													return {
														value: v.value.licensePlate,
														label: v.value.licensePlate,
													};
												})}
												options={{
													defaultValue: selectedVehicle?.value.licensePlate,
													displayAll: true,
													displayAllLabel: "All Vehicles",
												}}
												onSelect={handlePickerChange}
											/>
										</View>
									)}
									{orgRole && orgRole !== "org:viewer" && (
										<View>
											{Platform.OS === "android" ? (
												<View>
													<Pressable onPress={() => showMode("date")}>
														<View
															style={tw(
																"px-5 bg-gray-200 text-gray-700 font-semibold py-2 rounded"
															)}
														>
															<Text style={tw("text-gray-700 text-sm")}>
																{moment(date).format("yyyy-MM-DD")}
															</Text>
														</View>
													</Pressable>
													{show && (
														<DateTimePicker
															testID="dateTimePicker"
															display="default"
															value={moment(date).toDate()}
															mode="date"
															onChange={onDateChange}
														/>
													)}
												</View>
											) : (
												<DateTimePicker
													testID="dateTimePicker"
													display="default"
													value={moment(date).toDate()}
													mode="date"
													onChange={onDateChange}
												/>
											)}
										</View>
									)}
								</View>
							)}

							<View style={[tw("pb-2 p-5")]}>
								<TextInput
									placeholder="Search..."
									placeholderTextColor="#999"
									value={input}
									onChangeText={setInput}
									style={tw("text-sm rounded text-gray-700 border-b pb-2 border-gray-300")}
								/>
							</View>
						</View>
						<ScrollView contentContainerStyle={styles.scrollViewContent}>
							<View style={tw("px-0 py-2")}>
								{loadingOrders ? (
									<Text>Loading...</Text>
								) : error ? (
									<Text>Error! ${error.message}</Text>
								) : (
									customerOrders && (
										<OrderList
											orders={filteredOrdersWithInput}
											ordersIndex={ordersIndex}
											handleSelection={handleSelection}
										/>
									)
								)}
							</View>

							{selectedCustomerOrders && (
								<ModalOrderChangeStatus
									selectedCustomerOrders={selectedCustomerOrders}
									showLink={true}
									dateString={date}
									modalVisible={modalVisible}
									setModalVisible={setModalVisible}
									onMarkerSubmit={onMarkerSubmit}
								/>
							)}
						</ScrollView>
					</View>
				</View>
			</SignedIn>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollViewContent: {
		flexGrow: 1,
	},
});
