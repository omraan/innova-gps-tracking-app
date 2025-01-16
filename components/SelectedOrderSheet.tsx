import colors from "@/colors";
import { UPDATE_ORDER } from "@/graphql/mutations";
import { GET_ORDERS_BY_DATE } from "@/graphql/queries";
import { useDateStore } from "@/hooks/useDateStore";
import { useRouteSessionStore } from "@/hooks/useRouteSessionStore";
import { useLocation } from "@/providers/LocationProvider";
import { useMetadata } from "@/providers/MetaDataProvider";
import { useOrder } from "@/providers/OrderProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { useMutation, useQuery } from "@apollo/client";
import { useAuth } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { ModalConfirmation } from "./ModalConfirmation";

export default function SelectedOrderSheet() {
	const { bottomSheetRefs, handlePanDownToClose } = useSheetContext();
	const { selectedDate, isToday } = useDateStore();
	const { selectedOrder, setSelectedOrder }: any = useOrder();
	const { orgRole, statusCategories } = useMetadata();
	const { routeSession } = useRouteSessionStore();
	const { setActiveSheet } = useSheetContext();
	const [notes, setNotes] = useState<string>("");
	const { userId } = useAuth();
	const { isChangingLocation, setIsChangingLocation } = useLocation();

	const handleSave = (selectedStatus: StatusCategory | null) => {
		if (selectedStatus) {
			onMarkerSubmit(selectedStatus, notes);
		}

		setSelectedOrder(null);
		setActiveSheet(null);
		setNotes("");
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

	const customerWithLocation = selectedOrder?.customer?.lat !== 0;

	return (
		<BottomSheet
			ref={bottomSheetRefs.orders}
			index={-1}
			snapPoints={[customerWithLocation ? "50%" : "30%"]}
			enablePanDownToClose
			backgroundStyle={{ backgroundColor: "#f9f9f9" }}
			onChange={(index, position) => {
				if (index === -1) {
					handlePanDownToClose("orders");
					if (!isChangingLocation) {
						setSelectedOrder(null);
					}
				}
			}}
		>
			{selectedOrder && (
				<BottomSheetView style={{ flex: 1, padding: 15 }}>
					<View style={{ flexDirection: "row", gap: 20, marginBottom: 20 }}>
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
						<Pressable
							className="bg-primary p-3 rounded mb-auto"
							onPress={() => {
								setActiveSheet(null);
								setIsChangingLocation(true);
							}}
						>
							<MaterialIcons name="edit-location-alt" size={20} color="#ffffff" />
						</Pressable>
					</View>
					<View className="flex-row gap-2 my-5">
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

							<ModalConfirmation handleSave={handleSave} />
						</View>
					) : (
						<View>
							<Text>This Customer does not have location set.</Text>
						</View>
					)}
				</BottomSheetView>
			)}
		</BottomSheet>
	);
}
