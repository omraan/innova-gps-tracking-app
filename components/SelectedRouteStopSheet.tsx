import colors from "@/colors";
import { UPDATE_ROUTE_STOP } from "@/graphql/mutations";
import { useSelectionStore } from "@/hooks/useSelectionStore";
import { removeTypenameProperties } from "@/lib/removeTypenameProperties";
import { useLocation } from "@/providers/LocationProvider";
import { useMetadata } from "@/providers/MetaDataProvider";
import { useRoute } from "@/providers/RouteProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { useMutation } from "@apollo/client";
import { useAuth } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { ModalConfirmation } from "./ModalConfirmation";

export default function SelectedRouteStopSheet() {
	const { bottomSheetRefs, handlePanDownToClose } = useSheetContext();
	const { selectedRoute, setSelectedRoute, selectedRouteStop, setSelectedRouteStop, selectedDate, isToday } =
		useSelectionStore();
	const { orgRole } = useMetadata();
	const { setActiveSheet } = useSheetContext();
	const [notes, setNotes] = useState<string>("");
	const { userId } = useAuth();
	const { isChangingLocation, setIsChangingLocation } = useLocation();

	const handleSave = (selectedStatus: StatusCategory | null) => {
		if (selectedStatus) {
			onMarkerSubmit(selectedStatus, notes);
		}

		setSelectedRouteStop(null);
		setActiveSheet(null);
		setNotes("");
	};

	const [updateRouteStop] = useMutation(UPDATE_ROUTE_STOP, {
		onCompleted: () => {},
		onError: (error) => {
			console.error(error);
		},
	});

	async function onMarkerSubmit(status: StatusCategory, notes?: string) {
		if (selectedRouteStop && selectedRoute) {
			const variables: any = {
				id: selectedRouteStop.name,
				routeId: selectedRoute?.name,
				date: selectedDate,
				modifiedBy: userId!,
				modifiedAt: Number(new Date()),
				status: status.name,
			};

			let newEvent: any = {
				name: "Status updated",
				description: `Status updated to ${status.name}`,
				timestamp: new Date().toISOString(),
				userId: userId!,
			};

			const routeStopWithoutTypename = removeTypenameProperties(selectedRouteStop.value);

			const sanitizedRouteStopEvents = routeStopWithoutTypename.events;

			if (notes && notes !== "") {
				variables.notes = notes;
				newEvent.notes = notes;
			}
			variables.events = [...sanitizedRouteStopEvents, newEvent];
			updateRouteStop({
				variables,
			});
			setSelectedRouteStop({
				name: selectedRouteStop.name,
				value: {
					...selectedRouteStop.value,
					status: status.name,
				},
			});
			setSelectedRoute({
				name: selectedRoute.name,
				value: {
					...selectedRoute.value,
					stops: selectedRoute.value.stops.map((stop) => {
						if (stop.name !== selectedRouteStop.name) return stop;
						return {
							...stop,
							value: {
								...stop.value,
								status: status.name,
								notes: variables.notes || stop.value.notes || "",
								modifiedBy: userId!,
								modifiedAt: Number(new Date()),
								events: [...(stop.value.events || []), newEvent],
							},
						};
					}),
				},
			});
		}
	}

	const orderNumbers = selectedRouteStop?.value.dispatch?.orders?.map((o) => o.orderNumber).filter(Boolean);
	const customerWithLocation = selectedRouteStop?.value.location.latitude !== 0;

	return (
		<BottomSheet
			ref={bottomSheetRefs.dispatches}
			index={-1}
			enablePanDownToClose
			backgroundStyle={{ backgroundColor: "#f9f9f9" }}
			snapPoints={[customerWithLocation ? "50%" : "30%"]}
			onChange={(index, position) => {
				if (index === -1) {
					handlePanDownToClose("dispatches");
					if (!isChangingLocation) {
						setSelectedRouteStop(null);
					}
				}
			}}
		>
			{selectedRouteStop && (
				<BottomSheetView style={{ flex: 1, padding: 15 }}>
					<View style={{ flexDirection: "row", gap: 20, marginBottom: 10 }}>
						{/* <Image source={OrderImage} style={{ width: 60, height: 60 }} /> */}
						<View style={{ flex: 1, gap: 5 }}>
							<Text className="font-semibold text-2xl">{selectedRouteStop.value.displayName}</Text>
							<Text className="font-normal text-gray-500">{`${
								selectedRouteStop.value.location.streetName &&
								selectedRouteStop.value.location.streetName
							} ${
								selectedRouteStop.value.location.streetNumber &&
								selectedRouteStop.value.location.streetNumber
							}`}</Text>
							{selectedRouteStop.value.location.city && (
								<Text className="font-normal text-gray-500">
									{selectedRouteStop.value.location.city}
								</Text>
							)}
							{selectedRouteStop.value.dispatch?.customer.phoneNumbers &&
								selectedRouteStop.value.dispatch?.customer.phoneNumbers.length > 0 &&
								selectedRouteStop.value.dispatch?.customer.phoneNumbers.map((p) => (
									<Text className="font-normal text-gray-500">{p.number}</Text>
								))}
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
						{orderNumbers && orderNumbers.length > 0 ? (
							orderNumbers.map((orderNumber) => (
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
					{selectedRouteStop.value.notes || selectedRouteStop.value.dispatch?.customer.notes ? (
						<View className="mb-5 bg-gray-100 rounded-lg p-5">
							<Text className="text-center text-sm text-gray-400 mb-3">Notes</Text>
							<Text
								className="text-center flex flex-wrap"
								style={{ maxWidth: 300, marginBottom: selectedRouteStop.value.notes ? 5 : 0 }}
							>
								{selectedRouteStop.value.dispatch?.customer.notes}
							</Text>
							<Text className="text-center max-w-[300px] flex flex-wrap">
								{selectedRouteStop.value.notes}
							</Text>
						</View>
					) : (
						<View></View>
					)}

					{/* {orgRole && orgRole !== "org:viewer" && selectedDate == moment(new Date()).format("yyyy-MM-DD") && (
						
					)} */}
					{!selectedRoute?.value.actual.timeStart && (
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
							style={{ maxWidth: 300, opacity: !selectedRoute?.value.actual.timeStart ? 0.5 : 1 }}
							editable={
								orgRole && orgRole !== "org:viewer" && selectedRoute?.value.actual.timeStart
									? true
									: false
							}
							multiline={true}
							numberOfLines={4}
						/>
					</View>
					<ModalConfirmation handleSave={handleSave} />
				</BottomSheetView>
			)}
		</BottomSheet>
	);
}
