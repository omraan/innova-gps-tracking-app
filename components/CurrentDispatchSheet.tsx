import colors from "@/colors";
import { useSelectionStore } from "@/hooks/useSelectionStore";
import { useDispatch } from "@/providers/DispatchProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React from "react";
import { Text, View } from "react-native";

export default function CurrentDispatchSheet() {
	const { bottomSheetRefs, handlePanDownToClose } = useSheetContext();
	const { dispatches } = useDispatch();

	const { selectedDispatch, setSelectedDispatch } = useSelectionStore();

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
			index={-1}
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
