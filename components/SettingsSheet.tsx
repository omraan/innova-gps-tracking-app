import { GET_ORDERS_BY_DATE, GET_VEHICLES } from "@/graphql/queries";
import { useDateStore } from "@/hooks/useDateStore";
import { useRouteSessionStore } from "@/hooks/useRouteSessionStore";
import { useVehicleStore } from "@/hooks/useVehicleStore";
import { useSheetContext } from "@/providers/SheetProvider";
import { useQuery } from "@apollo/client";
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
import moment from "moment";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import DateTimePicker from "./DateTimePicker";
import { ModalPicker } from "./ModalPicker";

export default function SettingsSheet() {
	const { bottomSheetRefs, handlePanDownToClose } = useSheetContext();
	const { selectedDate, setSelectedDate } = useDateStore();
	const { routeSession } = useRouteSessionStore();

	const { selectedVehicle, setSelectedVehicle } = useVehicleStore();
	const { data: dataVehicles, refetch: refetchVehicles } = useQuery(GET_VEHICLES);
	const vehicles = dataVehicles?.getVehicles || [];

	const { refetch: refetchOrders } = useQuery(GET_ORDERS_BY_DATE, {
		variables: {
			date: selectedDate || moment(new Date()).format("yyyy-MM-DD"),
		},
		fetchPolicy: "network-only",
	});

	const onDateChange = (newDate: any) => {
		const currentDate = newDate;
		setSelectedDate(moment(currentDate).format("yyyy-MM-DD"));
	};

	const handlePickerChange = (value: string) => {
		setSelectedVehicle(vehicles.find((v: any) => v.value.licensePlate === value));
	};
	const [loading, setLoading] = useState<boolean>(false);

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

	return (
		<BottomSheet
			ref={bottomSheetRefs.settings}
			index={-1}
			// snapPoints={["50%"]}
			enablePanDownToClose
			enableDynamicSizing={true}
			backgroundStyle={{ backgroundColor: "#f9f9f9" }}
			onClose={() => handlePanDownToClose("settings")}
		>
			<BottomSheetView className="px-8 py-5">
				<View className="mb-8">
					<Text className="text-gray-500"></Text>
					<Pressable onPress={handleRefresh}>
						<View className="w-full px-5 bg-gray-200 border border-gray-300 text-gray-700 font-semibold py-4 rounded">
							<Text className="text-gray-700  text-center font-semibold">Refresh data</Text>
						</View>
					</Pressable>
				</View>
				<View className="mb-2">
					<Text className="text-gray-500">Choose Date</Text>
					<DateTimePicker currentDate={moment(selectedDate).toDate()} onChange={onDateChange} />
				</View>

				{vehicles && vehicles.length > 0 && (
					<View className="mb-10">
						<Text className="text-gray-500">Choose vehicle</Text>
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

				{/* <View className="">
					<Text className="text-gray-500">Default Map View</Text>
					{user && (
						<ModalPicker
							key={user?.unsafeMetadata.defaultMapView as string}
							list={MapViewOptions}
							options={{
								defaultValue: user.unsafeMetadata.defaultMapView as string,
								displayAll: false,
							}}
							onSelect={(value) =>
								user.update({
									unsafeMetadata: {
										...user.unsafeMetadata,
										defaultMapView: value,
									},
								})
							}
						/>
					)}
				</View> */}
			</BottomSheetView>
		</BottomSheet>
	);
}
