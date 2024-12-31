import { client } from "@/graphql/client";
import { useVehicleStore } from "@/hooks/useVehicleStore";
import { useSheetContext } from "@/providers/SheetProvider";
import { useAuth, useOrganizationList, useUser } from "@clerk/clerk-expo";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ModalPicker } from "./ModalPicker";

export default function AccountSheet() {
	const { bottomSheetRefs, handlePanDownToClose } = useSheetContext();
	const { signOut, isSignedIn } = useAuth();

	const { user } = useUser();
	const expoConfig = Constants.expoConfig;

	const { selectedVehicle, setSelectedVehicle } = useVehicleStore();

	const { userMemberships, setActive, isLoaded } = useOrganizationList({
		userMemberships: true,
		revalidate: true,
	});
	const { orgId } = useAuth();

	const organizations: any = userMemberships.data || [];

	const handleLogout = async () => {
		await client.clearStore();
		signOut();
	};
	useEffect(() => {
		setSelectedVehicle(undefined);
	}, [orgId]);

	return (
		<BottomSheet
			ref={bottomSheetRefs.account}
			index={-1}
			// snapPoints={["35%"]}
			enablePanDownToClose
			enableDynamicSizing={true}
			backgroundStyle={{ backgroundColor: "#f9f9f9" }}
			onClose={() => handlePanDownToClose("account")}
		>
			<BottomSheetScrollView
				style={{
					flex: 1,
					paddingVertical: 10,
					paddingHorizontal: 20,
				}}
			>
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
								// setLoading(true);
								if (setActive) {
									setActive({ organization: value });
								}
								// const timer = setTimeout(() => {
								// 	setLoading(false);
								// }, 5000);

								// return () => clearTimeout(timer);
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
