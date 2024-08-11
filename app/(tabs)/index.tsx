import LoadingScreen from "@/components/LoadingScreen";
import MapOrders from "@/components/MapOrders";
import ModalOrderChangeStatus from "@/components/ModalOrderChangeStatus";
import { ModalPicker } from "@/components/ModalPicker";
import OrderList from "@/components/OrderList";
import { UPDATE_ORDER } from "@/graphql/mutations";
import { GET_ORDERS_BY_DATE, GET_VEHICLES } from "@/graphql/queries";
import { getRelatedOrders } from "@/lib/getRelatedOrders";
import { useMutation, useQuery } from "@apollo/client";
import { SignedIn, useAuth, useOrganization } from "@clerk/clerk-expo";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment-timezone";
import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { useTailwind } from "tailwind-rn";

export default function Page() {
	const tw = useTailwind();
	const { organization } = useOrganization();
	const { userId, orgId } = useAuth();

	const [date, setDate] = useState<Date>(new Date());
	const dateString = moment(date).format("yyyy-MM-DD");

	const [input, setInput] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [modalVisible, setModalVisible] = useState<boolean>(false);

	const [customerOrders, setCustomerOrders] = useState<CustomerOrders[] | undefined>(undefined);
	const [filteredOrders, setFilteredOrders] = useState<CustomerOrders[]>([]);

	const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>(undefined);
	const [selectedCustomerOrders, setSelectedCustomerOrders] = useState<CustomerOrders | undefined>(undefined);

	const {
		data: orders,
		loading: loadingOrders,
		error,
		refetch: refetchOrders,
	} = useQuery(GET_ORDERS_BY_DATE, {
		variables: {
			date: dateString,
		},
		fetchPolicy: "no-cache",
	});
	const { data: vehicles } = useQuery(GET_VEHICLES);

	const [UpdateOrder] = useMutation(UPDATE_ORDER, {
		refetchQueries: [GET_ORDERS_BY_DATE],
		awaitRefetchQueries: true,
	});

	useEffect(() => {
		if (orders) {
			setCustomerOrders(getRelatedOrders(orders));
		}
	}, [orders]);

	useEffect(() => {
		if (vehicles && vehicles.length > 0) {
			if (!selectedVehicle) {
				const firstVehicle = Object.keys(vehicles)[0];
				setSelectedVehicle(vehicles[firstVehicle]);
			}
		} else {
			setSelectedVehicle(undefined);
		}
	}, [vehicles]);

	useEffect(() => {
		if (vehicles && selectedVehicle) {
			setSelectedVehicle(undefined);
		}
	}, [orgId]);

	useEffect(() => {
		try {
			if (customerOrders && selectedVehicle) {
				setFilteredOrders(
					customerOrders.filter((order: CustomerOrders) => order.vehicleId === selectedVehicle.id) || []
				);
			} else {
				setFilteredOrders([]);
			}
		} catch (error) {
			console.log("Error: ", error);
		}
	}, [date, customerOrders, selectedVehicle]);

	const handlePickerChange = (value: string) => {
		const newVehicle = vehicles.find((v: any) => v.licensePlate === value);
		if (newVehicle) setSelectedVehicle(newVehicle);
	};

	async function onMarkerSubmit(status: StatusCategory) {
		setLoading(true);
		if (selectedCustomerOrders) {
			await selectedCustomerOrders.orderIds.forEach((orderId: string) => {
				UpdateOrder({
					variables: {
						id: orderId,
						modifiedBy: userId!,
						modifiedAt: Number(new Date()),
						status: status.name,
					},
					refetchQueries: [GET_ORDERS_BY_DATE],
					awaitRefetchQueries: true,
					update: (cache) => {
						// Handmatig de cache bijwerken als dat nodig is
						const existingOrders: OrderExtended[] = cache.readQuery({ query: GET_ORDERS_BY_DATE }) || [];
						if (existingOrders) {
							const newOrders = existingOrders.map((existingOrder) =>
								existingOrder.id === orderId
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
			});
		}
		setLoading(false);
		setModalVisible(false);
	}

	const filteredOrdersWithInput = filteredOrders.filter((order: CustomerOrders) => {
		if (!input || input !== "") {
			return (
				order.customer.name.toLowerCase().includes(input.toLowerCase()) ||
				order.customer.code.toLowerCase().includes(input.toLowerCase())
			);
		}
	});

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

	const handleSelection = (order: CustomerOrders) => {
		setSelectedCustomerOrders(order);
		setModalVisible(true);
	};

	return (
		<SafeAreaView>
			<LoadingScreen loading={loading ? loading : loadingOrders} />
			<ScrollView>
				<SignedIn>
					<MapOrders
						orders={filteredOrders}
						handleRefresh={handleRefresh}
						handleSelection={handleSelection}
					/>

					<View style={tw("bg-white rounded px-5 pt-5 pb-2 flex flex-row justify-between")}>
						{vehicles && selectedVehicle?.id && (
							<ModalPicker
								key={organization?.slug}
								list={vehicles.map((v: any) => {
									return {
										value: v.licensePlate,
										label: v.licensePlate,
									};
								})}
								onChange={handlePickerChange}
							/>
						)}
						<RNDateTimePicker
							display="compact"
							value={date}
							mode="date"
							onChange={(event: any, value: any) =>
								setDate(moment.tz(new Date(value), "America/New_York").startOf("day").toDate())
							}
						/>
					</View>

					<View style={[tw("pb-2 p-5 rounded bg-white")]}>
						<TextInput
							placeholder="Search..."
							placeholderTextColor="#999"
							value={input}
							onChangeText={setInput}
							style={tw("text-sm rounded text-gray-700 border-b pb-2 border-gray-300")}
						/>
					</View>

					<ScrollView>
						<View style={tw("p-0")}>
							{loadingOrders ? (
								<Text>Loading...</Text>
							) : error ? (
								<Text>Error! ${error.message}</Text>
							) : (
								customerOrders && (
									<OrderList orders={filteredOrdersWithInput} handleSelection={handleSelection} />
								)
							)}
						</View>
					</ScrollView>
					{selectedCustomerOrders && (
						<ModalOrderChangeStatus
							selectedCustomerOrders={selectedCustomerOrders}
							dateString={dateString}
							modalVisible={modalVisible}
							setModalVisible={setModalVisible}
							onMarkerSubmit={onMarkerSubmit}
						/>
					)}
				</SignedIn>
			</ScrollView>
		</SafeAreaView>
	);
}
