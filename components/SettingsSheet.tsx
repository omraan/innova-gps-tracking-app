import { useSheetContext } from "@/providers/SheetProvider";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { StyleSheet, Text, View } from "react-native";
export default function SettingsSheet() {
	const { bottomSheetRefs, handlePanDownToClose } = useSheetContext();

	return (
		<BottomSheet
			ref={bottomSheetRefs.settings}
			index={-1}
			snapPoints={["70%"]}
			enablePanDownToClose
			enableDynamicSizing={false}
			backgroundStyle={{ backgroundColor: "#f9f9f9" }}
			onClose={() => handlePanDownToClose("settings")}
		>
			<BottomSheetScrollView
				style={{
					flex: 1,
					padding: 10,
				}}
			>
				<View>
					<Text>Settings</Text>
				</View>
			</BottomSheetScrollView>
		</BottomSheet>
	);
}
