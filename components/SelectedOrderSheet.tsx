import colors from "@/colors";
import { UPDATE_ORDER } from "@/graphql/mutations";
import { GET_ORDERS_BY_DATE } from "@/graphql/queries";
import { useDateStore } from "@/hooks/useDateStore";
import { useRouteSessionStore } from "@/hooks/useRouteSessionStore";
import { isColorDark } from "@/lib/styles";
import { useMetadata } from "@/providers/MetaDataProvider";
import { useOrder } from "@/providers/OrderProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { useMutation } from "@apollo/client";
import { useAuth } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Modal } from "./Modal";
export default function SelectedOrderSheet() {
	const { bottomSheetRefs, handlePanDownToClose } = useSheetContext();
	const { selectedDate, isToday } = useDateStore();
	const { selectedOrder, setSelectedOrder }: any = useOrder();
	const { orgRole, statusCategories } = useMetadata();
	const { routeSession } = useRouteSessionStore();
	const { setActiveSheet } = useSheetContext();
	const [notes, setNotes] = useState<string>("");
	const { userId } = useAuth();

	const [modalVisible, setModalVisible] = useState(false);

	const [selectedStatus, setSelectedStatus] = useState<StatusCategory | null>(null);

	const handleOpenModal = () => {
		setModalVisible(true);
	};

	const handleSave = () => {
		if (selectedStatus) {
			onMarkerSubmit(selectedStatus, notes);
			setModalVisible(false);
			setSelectedOrder(null);
			setActiveSheet(null);
			setNotes("");
		}
	};

	const [updateOrder] = useMutation(UPDATE_ORDER, {
		onCompleted: () => {},
		onError: (error) => {
			console.error(error);
		},
	});

	async function onMarkerSubmit(status: StatusCategory, notes?: string) {
		if (selectedOrder) {
			selectedOrder.orderIds.forEach((orderId: string) => {
				const variables: any = {
					id: orderId,
					date: selectedDate,
					modifiedBy: userId!,
					modifiedAt: Number(new Date()),
					status: status.name,
				};
				// orders.find((order: { name: string; value: Order }) => order.name === orderId).value.events || [];
				const sanitizedOrderEvents = selectedOrder.events.map(({ __typename, ...rest }: any) => rest);

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
						// setLoading(false);
						// setModalVisible(false);
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

	if (!selectedOrder) return null;

	const customerWithLocation = selectedOrder.customer.lat !== 0;

	return (
		<BottomSheet
			ref={bottomSheetRefs.orders}
			index={-1}
			snapPoints={[customerWithLocation ? "50%" : "30%"]}
			enablePanDownToClose
			backgroundStyle={{ backgroundColor: "#f9f9f9" }}
			onClose={() => handlePanDownToClose("orders")}
		>
			{selectedOrder && (
				<BottomSheetView style={{ flex: 1, padding: 15 }}>
					<View style={{ flexDirection: "row", gap: 20, marginBottom: 20 }}>
						{/* <Image source={OrderImage} style={{ width: 60, height: 60 }} /> */}
						<View style={{ flex: 1, gap: 5 }}>
							<Text className="font-semibold text-2xl">{selectedOrder.customer.name}</Text>
							<Text className="font-normal text-gray-500">{`${
								selectedOrder.customer.streetName && selectedOrder.customer.streetName
							} ${selectedOrder.customer.streetNumber && selectedOrder.customer.streetNumber}`}</Text>
							{selectedOrder.customer.city && (
								<Text className="font-normal text-gray-500">{selectedOrder.customer.city}</Text>
							)}
							{selectedOrder.customer.phoneNumber && (
								<Text className="font-normal text-gray-500">{selectedOrder.customer.phoneNumber}</Text>
							)}
							{selectedOrder.customer.phoneNumber2 && (
								<Text className="font-normal text-gray-500">{selectedOrder.customer.phoneNumber2}</Text>
							)}
							{selectedOrder.customer.phoneNumber3 && (
								<Text className="font-normal text-gray-500">{selectedOrder.customer.phoneNumber3}</Text>
							)}
						</View>
						<View style={{ flex: 1, flexDirection: "column", gap: 2, alignItems: "flex-end" }}>
							{selectedOrder.orderNumbers && selectedOrder.orderNumbers.length > 0 ? (
								selectedOrder.orderNumbers.map((orderNumber: string) => (
									<View>
										<Text>{orderNumber}</Text>
									</View>
								))
							) : (
								<View className="bg-primary/20 py-2 px-4 rounded">
									<Text className="text-primary font-bold">No order number</Text>
								</View>
							)}
						</View>
					</View>
					{selectedOrder.notes || selectedOrder.customer.notes ? (
						<View className="mb-5 bg-gray-100 rounded-lg p-5">
							<Text className="text-center text-sm text-gray-400 mb-3">Notes</Text>
							<Text
								className="text-center flex flex-wrap"
								style={{ maxWidth: 300, marginBottom: selectedOrder.notes ? 5 : 0 }}
							>
								{selectedOrder.customer.notes}
							</Text>
							<Text className="text-center max-w-[300px] flex flex-wrap">{selectedOrder.notes}</Text>
						</View>
					) : (
						<View />
					)}
					{/* {orgRole && orgRole !== "org:viewer" && selectedDate == moment(new Date()).format("yyyy-MM-DD") && (
						
					)} */}
					{routeSession === null && (
						<View className="bg-red-200 border border-red-400 p-5 rounded mb-5 ">
							<Text className="text-md text-red-700">
								{!isToday() ? (
									<View className="py-2">
										<Text className="text-md text-red-700 mb-2">
											This order is not part of a route session of today.
										</Text>
										<View className="flex-row justify-start gap-2 items-center">
											<Text className="text-md text-red-700">Navigate to </Text>
											<View className="rounded-full border border-red-700 p-2">
												<MaterialIcons name="settings" size={16} color={colors.secondary} />
											</View>
											<Text className="text-md text-red-700">to change the date.</Text>
										</View>
									</View>
								) : (
									<Text className="text-md text-red-700">
										Please Press "Start route" before updating status
									</Text>
								)}
							</Text>
						</View>
					)}

					{selectedOrder.customer.lat !== 0 ? (
						<View>
							<View className="mb-5">
								<TextInput
									placeholder={orgRole && orgRole !== "org:viewer" ? "Type Notes" : "No notes"}
									placeholderTextColor="#999"
									value={notes}
									onChangeText={setNotes}
									className="text-sm rounded text-gray-700 border-b pb-2 border-gray-300 flex flex-wrap text-wrap "
									style={{ maxWidth: 300, opacity: routeSession === null ? 0.5 : 1 }}
									editable={
										orgRole && orgRole !== "org:viewer" && routeSession !== null ? true : false
									}
									multiline={true}
									numberOfLines={4}
								/>
							</View>

							<View className="flex-row justify-between items-center mb-5">
								{statusCategories &&
									statusCategories.length > 0 &&
									statusCategories
										.filter((s) => s.name !== "No Location")
										.map((status) => (
											<Pressable
												key={status.name}
												onPress={() => {
													if (routeSession && routeSession !== null) {
														setSelectedStatus(status);
														handleOpenModal();
													}
												}}
												disabled={routeSession === null}
												className="flex-1 rounded py-4 mx-1"
												style={{
													borderWidth: !isColorDark(status.color) ? 1 : 0,
													borderColor: "#dddddd",
													backgroundColor: status.color,
													opacity: routeSession === null ? 0.5 : 1,
													display: status.name !== selectedOrder.status ? "flex" : "none",
												}}
											>
												<Text
													className="text-center"
													style={{ color: isColorDark(status.color) ? "white" : "#666666" }}
												>
													{status.name}
												</Text>
											</Pressable>
										))}
							</View>
						</View>
					) : (
						<View>
							<Text>This Customer does not have location set.</Text>
						</View>
					)}

					<Modal modalVisible={modalVisible} setModalVisible={setModalVisible} handleSave={handleSave}>
						<View className="mb-10">
							<Text className="font-semibold text-2xl text-center mb-5">Change Status</Text>
							<Text className="font-normal text-gray-500 text-center mb-10">
								Select the new status for this order: {selectedOrder.customer.name}
							</Text>
							<View
								className="border rounded px-5 py-2 mx-auto"
								style={{ borderColor: selectedStatus?.color }}
							>
								<Text
									className="font-bold text-primary text-center text-2xl"
									style={{ color: selectedStatus?.color }}
								>
									{selectedStatus?.name}
								</Text>
							</View>
						</View>
					</Modal>
				</BottomSheetView>
			)}
		</BottomSheet>
	);
}
