import { GET_DISPATCHES, GET_ROUTES, GET_VEHICLES } from "@/graphql/queries";
import { useDateStore } from "@/hooks/useDateStore";
import { useVehicleStore } from "@/hooks/useVehicleStore";
import toastPromise from "@/lib/toastPromise";
import { useRoute } from "@/providers/RouteProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { useQuery } from "@apollo/client";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import moment from "moment";
import { Pressable, Text, View } from "react-native";
import DateTimePicker from "./DateTimePicker";
import { ModalPicker } from "./ModalPicker";
export default function SettingsSheet() {
	const { bottomSheetRefs, handlePanDownToClose } = useSheetContext();
	const { selectedDate, setSelectedDate } = useDateStore();

	const { selectedRoute, refetchRoutes } = useRoute();
	const { selectedVehicle, setSelectedVehicle } = useVehicleStore();

	const { refetch: refetchDispatches } = useQuery(GET_DISPATCHES, { fetchPolicy: "network-only" });
	const { data: dataVehicles, refetch: refetchVehicles } = useQuery(GET_VEHICLES, { fetchPolicy: "network-only" });
	const vehicles = dataVehicles?.getVehicles || [];

	const onDateChange = (newDate: any) => {
		const currentDate = newDate;
		setSelectedDate(moment(currentDate).format("yyyy-MM-DD"));
	};

	const handlePickerChange = (value: string) => {
		setSelectedVehicle(vehicles.find((v: any) => v.value.licensePlate === value));
	};

	const handleRefresh = async () => {
		const promises = Promise.all([
			refetchRoutes(),
			// refetchDispatches({
			// 	variables: {
			// 		routeId: selectedRoute?.name,
			// 	},
			// }),
			refetchVehicles(),
		]);

		toastPromise(promises, {
			loading: "Refreshing data...",
			success: "Data refreshed",
			error: "Failed to refresh data",
		});
	};

	return (
		<BottomSheet
			ref={bottomSheetRefs.settings}
			index={-1}
			enablePanDownToClose
			enableDynamicSizing={true}
			backgroundStyle={{ backgroundColor: "#f9f9f9" }}
			onClose={() => handlePanDownToClose("settings")}
		>
			<BottomSheetView className="px-8 py-3">
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
				<View className="mb-10">
					{vehicles && vehicles.length > 0 && (
						<View className="">
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
								disabled={selectedRoute?.value.startTime ? true : false}
							/>
						</View>
					)}
				</View>

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
