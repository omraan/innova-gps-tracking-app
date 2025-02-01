import colors from "@/colors";
import { UPDATE_DISPATCH } from "@/graphql/mutations";
import { useDateStore } from "@/hooks/useDateStore";
import { removeTypenameProperties } from "@/lib/removeTypenameProperties";
import { useDispatch } from "@/providers/DispatchProvider";
import { useLocation } from "@/providers/LocationProvider";
import { useMetadata } from "@/providers/MetaDataProvider";
import { useRoute } from "@/providers/RouteProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { useMutation } from "@apollo/client";
import { useAuth } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { ModalConfirmation } from "./ModalConfirmation";

export default function CurrentDispatchSheet() {
	const { bottomSheetRefs, handlePanDownToClose } = useSheetContext();
	const { dispatches, setDispatches, selectedDispatch, setSelectedDispatch } = useDispatch();

	// const { activeSheet, setActiveSheet } = useSheetContext();
	// // if (!dispatches) return;

	const currentDispatch = dispatches
		?.filter((dispatch) => dispatch.value.status === "Open")
		?.sort((a, b) => a.value.route.index! - b.value.route.index!)[0];

	// if (!currentDispatch) return;
	// console.log("test");

	return (
		<BottomSheet
			ref={bottomSheetRefs.currentDispatch}
			// index={-1}
			backgroundStyle={{ backgroundColor: "#ffffff" }}
			snapPoints={[110]}
		>
			{currentDispatch && (
				<BottomSheetView style={{ flex: 1, paddingVertical: 5, paddingHorizontal: 20 }}>
					<View style={{ flexDirection: "row", gap: 20 }}>
						{/* <Image source={OrderImage} style={{ width: 60, height: 60 }} /> */}
						<View style={{ flex: 1, gap: 5 }}>
							<Text className="font-semibold text-2xl">{currentDispatch.value.customer.name}</Text>
							<Text className="">
								{currentDispatch.value.customer.streetName}{" "}
								{currentDispatch.value.customer.streetNumber || ""}
							</Text>
						</View>
						<View>
							<View className="flex-row gap-2 items-center justify-end">
								<Text className="font-semibold text-xl text-right">
									{currentDispatch.value.route.duration &&
										(currentDispatch.value.route.duration / 60).toFixed(0)}{" "}
									min
								</Text>
								<MaterialIcons name="access-time" color={colors.primary} size={15} />
							</View>
							<View className="flex-row gap-2 items-center justify-end">
								<Text className="font-semibold text-sm text-right text-gray-500">
									{currentDispatch.value.route.distance &&
										(currentDispatch.value.route.distance / 1000).toFixed(1)}{" "}
									km
								</Text>
								<FontAwesome5 name="arrows-alt-h" color={colors.primary} size={14} />
							</View>
						</View>
					</View>
				</BottomSheetView>
			)}
		</BottomSheet>
	);
}
