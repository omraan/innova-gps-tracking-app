import { MapViewOptions } from "@/constants/MapViewOptions";
import { client } from "@/graphql/client";
import { GET_VEHICLES } from "@/graphql/queries";
import { useDateStore } from "@/hooks/useDateStore";
import { useRouteSessionStore } from "@/hooks/useRouteSessionStore";
import { useVehicleStore } from "@/hooks/useVehicleStore";
import { useSheetContext } from "@/providers/SheetProvider";
import { useQuery } from "@apollo/client";
import { useAuth, useOrganizationList, useUser } from "@clerk/clerk-expo";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Constants from "expo-constants";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import DateTimePicker from "./DateTimePicker";
import { ModalPicker } from "./ModalPicker";

export default function SettingsSheet() {
	const { bottomSheetRefs, handlePanDownToClose } = useSheetContext();
	const { signOut, isSignedIn } = useAuth();
	const { selectedDate, setSelectedDate } = useDateStore();
	const { routeSession } = useRouteSessionStore();

	const { user } = useUser();
	const expoConfig = Constants.expoConfig;

	const { selectedVehicle, setSelectedVehicle } = useVehicleStore();
	const { data: dataVehicles, refetch: refetchVehicles } = useQuery(GET_VEHICLES);
	const vehicles = dataVehicles?.getVehicles || [];

	const { userMemberships, setActive, isLoaded } = useOrganizationList({
		userMemberships: true,
		revalidate: true,
	});
	const { orgId } = useAuth();

	const organizations: any = userMemberships.data || [];
	const [loading, setLoading] = useState(false);

	const onDateChange = (newDate: any) => {
		const currentDate = newDate;
		setSelectedDate(moment(currentDate).format("yyyy-MM-DD"));
	};
	const handleLogout = async () => {
		await client.clearStore();
		signOut();
	};

	const handlePickerChange = (value: string) => {
		setSelectedVehicle(vehicles.find((v: any) => v.value.licensePlate === value));
	};
	useEffect(() => {
		setSelectedVehicle(undefined);
	}, [orgId]);

	return (
		<BottomSheet
			ref={bottomSheetRefs.settings}
			index={-1}
			snapPoints={["50%"]}
			enablePanDownToClose
			enableDynamicSizing={false}
			backgroundStyle={{ backgroundColor: "#f9f9f9" }}
			onClose={() => handlePanDownToClose("settings")}
		>
			<BottomSheetScrollView
				style={{
					flex: 1,
					paddingVertical: 10,
					paddingHorizontal: 20,
				}}
			>
				<View className="mb-2">
					<Text className="text-gray-500">Choose Date</Text>
					<DateTimePicker currentDate={moment(selectedDate).toDate()} onChange={onDateChange} />
				</View>

				{vehicles && vehicles.length > 0 && (
					<View>
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

				{orgId && organizations && organizations.length > 1 && (
					<View className="mb-10">
						<Text className="text-gray-500">Choose organization</Text>
						<ModalPicker
							list={organizations.map((mem: any) => {
								return {
									value: mem.organization.id,
									label: mem.organization.name,
								};
							})}
							options={{
								defaultValue: orgId,
							}}
							onSelect={(value) => {
								setLoading(true);
								if (setActive) {
									setActive({ organization: value });
								}
								const timer = setTimeout(() => {
									setLoading(false);
								}, 5000);

								return () => clearTimeout(timer);
							}}
						/>
					</View>
				)}

				<TouchableOpacity className="bg-red-800 py-4 rounded" onPress={handleLogout}>
					<Text className="text-white text-center">Log Out</Text>
				</TouchableOpacity>
				<View className="mt-5 mb-20">
					<Text>User: {user?.primaryEmailAddress?.toString() || ""}</Text>
					<Text>Version: {expoConfig?.version}</Text>
				</View>
			</BottomSheetScrollView>
		</BottomSheet>
	);
}
