import colors from "@/colors";
import { useRouteSessionStore } from "@/hooks/useRouteSessionStore";
import { isColorDark } from "@/lib/styles";
import { useMetadata } from "@/providers/MetaDataProvider";
import { useOrder } from "@/providers/OrderProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTailwind } from "tailwind-rn";
export default function SelectedOrderSheet() {
	const { bottomSheetRefs, handlePanDownToClose } = useSheetContext();

	const { selectedOrder }: any = useOrder();
	const { orgRole, statusCategories } = useMetadata();
	const { routeSession } = useRouteSessionStore();
	const [notes, setNotes] = useState<string>("");

	return (
		<BottomSheet
			ref={bottomSheetRefs.orders}
			index={-1}
			snapPoints={["50%"]}
			enablePanDownToClose
			// enableDynamicSizing
			backgroundStyle={{ backgroundColor: "#f9f9f9" }}
			onClose={() => handlePanDownToClose("orders")}
		>
			{selectedOrder && (
				<BottomSheetView style={styles.contentContainer}>
					<View style={{ flexDirection: "row", gap: 20, marginBottom: 20 }}>
						{/* <Image source={OrderImage} style={{ width: 60, height: 60 }} /> */}
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
						<View style={{ flex: 1, flexDirection: "column", gap: 2, alignItems: "flex-end" }}>
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
						<View></View>
					)}
					{/* {orgRole && orgRole !== "org:viewer" && selectedDate == moment(new Date()).format("yyyy-MM-DD") && (
						
					)} */}
					{routeSession === null && (
						<View className="bg-red-200 border border-red-400 p-3 rounded mb-5 ">
							<Text className="text-md text-red-700">
								Please Press "Start route" before updating status
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
							style={{ maxWidth: 300, opacity: routeSession === null ? 0.5 : 1 }}
							editable={orgRole && orgRole !== "org:viewer" && routeSession !== null ? true : false}
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
											if (routeSession && routeSession !== null) {
												// onMarkerSubmit(status, notes);
												setNotes("");
											}
										}}
										disabled={routeSession === null}
										className="flex-1 rounded py-4 mx-1"
										style={{
											borderWidth: !isColorDark(status.color) ? 1 : 0,
											borderColor: "#dddddd",
											backgroundColor: status.color,
											opacity: routeSession === null ? 0.5 : 1,
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
				</BottomSheetView>
			)}
		</BottomSheet>
	);
}
const styles = StyleSheet.create({
	contentContainer: {
		flex: 1,
		padding: 15,
	},
});
