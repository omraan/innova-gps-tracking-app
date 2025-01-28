import colors from "@/colors";
import { UPDATE_DISPATCH } from "@/graphql/mutations";
import { GET_DISPATCHES } from "@/graphql/queries";
import { useDateStore } from "@/hooks/useDateStore";
import { isColorDark } from "@/lib/styles";
import { useDispatch } from "@/providers/DispatchProvider";
import { useMetadata } from "@/providers/MetaDataProvider";
import { useRoute } from "@/providers/RouteProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { useMutation } from "@apollo/client";
import { useAuth } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Modal } from "./Modal";
export default function SelectedDispatchSheet() {
	const { bottomSheetRefs, handlePanDownToClose } = useSheetContext();
	const { selectedDate, isToday } = useDateStore();
	const { selectedDispatch, setSelectedDispatch }: any = useDispatch();
	const { selectedRoute } = useRoute();

	const { orgRole, statusCategories } = useMetadata();

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
			setSelectedDispatch(null);
			setActiveSheet(null);
			setNotes("");
		}
	};

	const [updateDispatch] = useMutation(UPDATE_DISPATCH, {
		onCompleted: () => {},
		onError: (error) => {
			console.error(error);
		},
	});

	async function onMarkerSubmit(status: StatusCategory, notes?: string) {
		if (selectedDispatch) {
			const variables: any = {
				id: selectedDispatch.name,
				routeId: selectedDispatch.value.route.id,
				date: selectedDate,
				modifiedBy: userId!,
				modifiedAt: Number(new Date()),
				status: status.name,
			};

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
			const sanitizedDispatchEvents = selectedDispatch.events.map(({ __typename, ...rest }: any) => rest);

			if (notes && notes !== "") {
				variables.notes = notes;
				newEvent.notes = notes;
			}
			variables.events = [...sanitizedDispatchEvents, newEvent];
			updateDispatch({
				variables: variables,
				onCompleted: () => {
					// setLoading(false);
					// setModalVisible(false);
				},
				update: (cache) => {
					// Handmatig de cache bijwerken als dat nodig is
					const existingDispatches = cache.readQuery<{
						getDispatches: { name: string; value: DispatchExtended }[];
					}>({
						query: GET_DISPATCHES,
						variables: {
							routeId: selectedDispatch.value.route.id,
						},
					})?.getDispatches;

					if (existingDispatches) {
						const newDispatches = existingDispatches.map((existingDispatch) => {
							if (existingDispatch.name === selectedDispatch.name) {
								const newDispatch = {
									name: existingDispatch.name,
									value: {
										...existingDispatch.value,
										modifiedBy: userId!,
										modifiedAt: Number(new Date()),
										status: status.name,
										notes: variables.notes || existingDispatch.value.notes || "",
										events: [...(existingDispatch.value.events || []), newEvent],
									},
								};
								return newDispatch;
							}
							return existingDispatch;
						});

						cache.writeQuery({
							query: GET_DISPATCHES,
							variables: {
								date: selectedDate,
							},
							data: { getDispatches: newDispatches },
						});
					}
				},
			});
		}
	}

	return (
		<BottomSheet
			ref={bottomSheetRefs.dispatches}
			index={-1}
			snapPoints={["50%"]}
			enablePanDownToClose
			backgroundStyle={{ backgroundColor: "#f9f9f9" }}
			onClose={() => {
				setSelectedDispatch(null);
				handlePanDownToClose("dispatches");
			}}
		>
			{selectedDispatch && (
				<BottomSheetView style={{ flex: 1, padding: 15 }}>
					<View style={{ flexDirection: "row", gap: 20, marginBottom: 20 }}>
						{/* <Image source={OrderImage} style={{ width: 60, height: 60 }} /> */}
						<View style={{ flex: 1, gap: 5 }}>
							<Text className="font-semibold text-2xl">{selectedDispatch.customer.name}</Text>
							<Text className="font-normal text-gray-500">{`${
								selectedDispatch.customer.streetName && selectedDispatch.customer.streetName
							} ${
								selectedDispatch.customer.streetNumber && selectedDispatch.customer.streetNumber
							}`}</Text>
							{selectedDispatch.customer.city && (
								<Text className="font-normal text-gray-500">{selectedDispatch.customer.city}</Text>
							)}
							{selectedDispatch.customer.phoneNumber && (
								<Text className="font-normal text-gray-500">
									{selectedDispatch.customer.phoneNumber}
								</Text>
							)}
							{selectedDispatch.customer.phoneNumber2 && (
								<Text className="font-normal text-gray-500">
									{selectedDispatch.customer.phoneNumber2}
								</Text>
							)}
							{selectedDispatch.customer.phoneNumber3 && (
								<Text className="font-normal text-gray-500">
									{selectedDispatch.customer.phoneNumber3}
								</Text>
							)}
						</View>
						<View style={{ flex: 1, flexDirection: "column", gap: 2, alignItems: "flex-end" }}>
							{selectedDispatch.orderNumbers && selectedDispatch.orderNumbers.length > 0 ? (
								selectedDispatch.orderNumbers.map((orderNumber: string) => (
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
					{selectedDispatch.notes || selectedDispatch.customer.notes ? (
						<View className="mb-5 bg-gray-100 rounded-lg p-5">
							<Text className="text-center text-sm text-gray-400 mb-3">Notes</Text>
							<Text
								className="text-center flex flex-wrap"
								style={{ maxWidth: 300, marginBottom: selectedDispatch.notes ? 5 : 0 }}
							>
								{selectedDispatch.customer.notes}
							</Text>
							<Text className="text-center max-w-[300px] flex flex-wrap">{selectedDispatch.notes}</Text>
						</View>
					) : (
						<View></View>
					)}
					{/* {orgRole && orgRole !== "org:viewer" && selectedDate == moment(new Date()).format("yyyy-MM-DD") && (
						
					)} */}
					{!selectedRoute?.value.startTime && (
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
												<MaterialIcons name="settings" size={16} color={colors.primary} />
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
					<View className="mb-5">
						<TextInput
							placeholder={orgRole && orgRole !== "org:viewer" ? "Type Notes" : "No notes"}
							placeholderTextColor="#999"
							value={notes}
							onChangeText={setNotes}
							className="text-sm rounded text-gray-700 border-b pb-2 border-gray-300 flex flex-wrap text-wrap "
							style={{ maxWidth: 300, opacity: !selectedRoute?.value.startTime ? 0.5 : 1 }}
							editable={
								orgRole && orgRole !== "org:viewer" && selectedRoute?.value.startTime ? true : false
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
											if (selectedRoute?.value.startTime) {
												setSelectedStatus(status);
												handleOpenModal();
											}
										}}
										disabled={!selectedRoute?.value.startTime}
										className="flex-1 rounded py-4 mx-1"
										style={{
											borderWidth: !isColorDark(status.color) ? 1 : 0,
											borderColor: "#dddddd",
											backgroundColor: status.color,
											opacity: !selectedRoute?.value.startTime ? 0.5 : 1,
											display: status.name !== selectedDispatch.status ? "flex" : "none",
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

					<Modal modalVisible={modalVisible} setModalVisible={setModalVisible} handleSave={handleSave}>
						<View className="mb-10">
							<Text className="font-semibold text-2xl text-center mb-5">Change Status</Text>
							<Text className="font-normal text-gray-500 text-center mb-10">
								Select the new status for this order: {selectedDispatch.customer.name}
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
