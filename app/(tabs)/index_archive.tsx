import { DeviceDependedView } from "@/components/DeviceDependendView";
import LoadingScreen from "@/components/LoadingScreen";
import MapOrders from "@/components/MapOrders";
import ModalOrderChangeStatus from "@/components/ModalOrderChangeStatus";
import { ModalPicker } from "@/components/ModalPicker";
import OrderList from "@/components/OrderList";
import RouteSession from "@/components/RouteSession";
import { UPDATE_ORDER } from "@/graphql/mutations";
import { GET_ORDERS_BY_DATE, GET_VEHICLES } from "@/graphql/queries";
import { useDateStore } from "@/hooks/useDateStore";
import { useRouteSessionStore } from "@/hooks/useRouteSessionStore";
import { useVehicleStore } from "@/hooks/useVehicleStore";
import { getRelatedOrders } from "@/lib/getRelatedOrders";
import { useMutation, useQuery } from "@apollo/client";
import { SignedIn, useAuth, useOrganization, useUser } from "@clerk/clerk-expo";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment-timezone";
import React, { useEffect, useState } from "react";
import {
	Platform,
	Pressable,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	useWindowDimensions,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTailwind } from "tailwind-rn";

export default function Page() {
	const tw = useTailwind();
	const { organization } = useOrganization();
	const { user } = useUser();
	const { userId, orgId, orgRole: authRole } = useAuth();

	const { selectedDate, setSelectedDate } = useDateStore();

	const [input, setInput] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [modalVisible, setModalVisible] = useState<boolean>(false);

	const [customerOrders, setCustomerOrders] = useState<CustomerOrders[]>([]);
	const [filteredOrders, setFilteredOrders] = useState<CustomerOrders[]>([]);

	const { selectedVehicle, setSelectedVehicle } = useVehicleStore();
	const [selectedCustomerOrders, setSelectedCustomerOrders] = useState<CustomerOrders | undefined>(undefined);

	const { routeSession } = useRouteSessionStore();

	const { width, height } = useWindowDimensions();
	const insets = useSafeAreaInsets();

	const isLandscape = width > height;
	const isTablet = width >= 768;

	const safeAreaHeight = height - insets.top - insets.bottom - 25;

	const containerStyle = [
		isLandscape && isTablet ? { width: width * 0.6, height } : isTablet ? { height: 500 } : { height: 300 },
	];

	const {
		data: dataOrders,
		loading: loadingOrders,
		error,
		refetch: refetchOrders,
	} = useQuery(GET_ORDERS_BY_DATE, {
		variables: {
			date: selectedDate || moment(new Date()).format("yyyy-MM-DD"),
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
		if (!selectedDate) {
			const currentDate = moment(new Date()).format("yyyy-MM-DD");
			setSelectedDate(currentDate);
		}
	}, [selectedDate]);

	useEffect(() => {
		if (orders && orders.length > 0) {
			const relatedOrders = getRelatedOrders(orders);

			if (selectedVehicle) {
				setFilteredOrders(
					relatedOrders.filter((order: CustomerOrders) => order.vehicleId === selectedVehicle.name) || []
				);
			} else {
				setFilteredOrders(relatedOrders);
			}
			setCustomerOrders(relatedOrders);
		} else {
			if (customerOrders && customerOrders.length > 0) {
				setCustomerOrders([]);
				setFilteredOrders([]);
			}
		}
	}, [orders, selectedDate, selectedVehicle]);

	useEffect(() => {
		if (orgId && user) {
			const metaData = user?.unsafeMetadata?.organizations?.[orgId];
			if (vehicles?.length > 0 && metaData?.vehicleId) {
				setSelectedVehicle(vehicles.find((v: Vehicle) => v.name === metaData.vehicleId));
			}
		}
	}, [vehicles, user, orgId]);

	const handlePickerChange = (value: string) => {
		setSelectedVehicle(vehicles.find((v: any) => v.value.licensePlate === value));
	};

	async function onMarkerSubmit(status: StatusCategory, notes?: string) {
		setLoading(true);
		if (selectedCustomerOrders) {
			selectedCustomerOrders.orderIds.forEach((orderId: string) => {
				const variables: any = {
					id: orderId,
					date: selectedDate,
					modifiedBy: userId!,
					modifiedAt: Number(new Date()),
					status: status.name,
				};
				const selectedOrderEvents =
					orders.find((order: { name: string; value: Order }) => order.name === orderId).value.events || [];
				const sanitizedOrderEvents = selectedOrderEvents.map(({ __typename, ...rest }: any) => rest);

				let newEvent: any = {
					name: "",
					notes: "",
					createdBy: userId!,
					createdAt: Number(new Date()),
					status: status.name,
				};
				if (notes && notes !== "") {
					variables.notes = notes;
					newEvent.notes = notes;
				}
				variables.events = [...sanitizedOrderEvents, newEvent];

				updateOrder({
					variables: variables,
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
								date: selectedDate,
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
											notes: variables.notes || existingOrder.value.notes || "",
											events: [...(existingOrder.value.events || []), newEvent],
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
			});
		}
	}

	const filteredOrdersWithInput = filteredOrders.filter((order: CustomerOrders) => {
		if ((!input || input !== "") && order.customer) {
			return (
				order.customer.name.toLowerCase().includes(input.toLowerCase()) ||
				order.customer.code.toLowerCase().includes(input.toLowerCase()) ||
				order.customer.streetName?.toLowerCase().includes(input.toLowerCase()) ||
				order.orderNumbers.some(
					(orderNumber: number) => orderNumber && orderNumber.toString().includes(input.toLowerCase())
				)
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

	const [show, setShow] = useState(false);

	const onDateChange = (event: any, newDate: any) => {
		const currentDate = newDate;
		setShow(Platform.OS === "ios");
		setSelectedDate(moment(currentDate).format("yyyy-MM-DD"));
	};

	const showMode = (currentMode: any) => {
		setShow(true);
	};
	return (
		<SafeAreaView style={{ flex: 1 }}>
			<DeviceDependedView tabletLandscapeView="view">
				<LoadingScreen loading={loading ? loading : loadingOrders} />
				<SignedIn>
					{selectedDate === moment(new Date()).format("yyyy-MM-DD") ? <RouteSession /> : <View />}
					{/* <View>
						<Text>{isLandscape ? "Is landscape" : "Is portret"}</Text>
						<Text>{isTablet ? "Is tablet" : "Is phone"}</Text>
					</View> */}
					<View style={tw("xl:flex-row h-full ")}>
						<View style={tw("z-[3] xl:w-[60%]")}>
							<View style={containerStyle}>
								{organization?.publicMetadata.lat && (
									<MapOrders
										orders={filteredOrdersWithInput}
										handleRefresh={handleRefresh}
										handleSelection={handleSelection}
									/>
								)}
							</View>
						</View>
						<View style={[tw("xl:w-[40%] h-full flex flex-col")]}>
							<View
								style={[
									tw("xl:fixed z-[5] bg-white"),
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
									<View style={[tw("px-5 pt-5 pb-2 flex flex-row justify-between")]}>
										{vehicles && vehicles.length > 0 && (
											<View style={tw(`min-w-[125px] md:min-w-[200px]`)}>
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
													disabled={routeSession ? true : false}
												/>
											</View>
										)}
										{orgRole !== "org:viewer" && (
											<View>
												{Platform.OS === "android" ? (
													<View>
														<Pressable onPress={() => showMode("date")}>
															<View
																style={tw(
																	`px-5 bg-gray-200 text-gray-700 font-semibold py-2 rounded ${
																		routeSession ? "opacity-30" : "opacity-100"
																	}`
																)}
															>
																<Text style={tw("text-gray-700 text-sm")}>
																	{moment(selectedDate).format("yyyy-MM-DD")}
																</Text>
															</View>
														</Pressable>
														{show && (
															<DateTimePicker
																testID="dateTimePicker"
																display="default"
																value={moment(selectedDate).toDate()}
																mode="date"
																onChange={onDateChange}
															/>
														)}
													</View>
												) : (
													<DateTimePicker
														testID="dateTimePicker"
														display="default"
														value={moment(selectedDate).toDate()}
														mode="date"
														onChange={onDateChange}
														disabled={routeSession ? true : false}
														style={tw(`${routeSession ? "opacity-30" : "opacity-100"} `)}
														textColor="black"
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
							<View style={{ flex: 1, minHeight: 500 }}>
								<DeviceDependedView tabletLandscapeView="scroll">
									<View style={tw("px-0 py-2 mb-20 min-h-[500px]")}>
										{loadingOrders ? (
											<Text>Loading...</Text>
										) : error ? (
											<Text>Error! ${error.message}</Text>
										) : (
											customerOrders && (
												<OrderList
													orders={filteredOrdersWithInput}
													handleSelection={handleSelection}
												/>
											)
										)}
									</View>
								</DeviceDependedView>
							</View>
						</View>
						{selectedCustomerOrders && (
							<ModalOrderChangeStatus
								selectedCustomerOrders={selectedCustomerOrders}
								showLink={true}
								modalVisible={modalVisible}
								setModalVisible={setModalVisible}
								onMarkerSubmit={onMarkerSubmit}
							/>
						)}
					</View>
				</SignedIn>
			</DeviceDependedView>
		</SafeAreaView>
	);
}
