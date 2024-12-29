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
	const tw = useTailwind();
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
							<Text style={tw("font-semibold text-lg")}>{selectedOrder.customer.name}</Text>
							<Text style={tw("font-normal")}>{`${
								selectedOrder.customer.streetName && selectedOrder.customer.streetName
							} ${selectedOrder.customer.streetNumber && selectedOrder.customer.streetNumber}`}</Text>
							{selectedOrder.customer.city && (
								<Text style={tw("font-normal")}>{selectedOrder.customer.city}</Text>
							)}
							{selectedOrder.customer.phoneNumber && (
								<Text style={tw("font-normal")}>{selectedOrder.customer.phoneNumber}</Text>
							)}
							{selectedOrder.customer.phoneNumber2 && (
								<Text style={tw("font-normal")}>{selectedOrder.customer.phoneNumber2}</Text>
							)}
							{selectedOrder.customer.phoneNumber3 && (
								<Text style={tw("font-normal")}>{selectedOrder.customer.phoneNumber3}</Text>
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
								<View style={tw("bg-primary/20 py-2 px-4 rounded")}>
									<Text style={(tw("text-primary font-bold"), { color: colors.primary })}>
										No order number
									</Text>
								</View>
							)}
						</View>
					</View>
					{selectedOrder.notes || selectedOrder.customer.notes ? (
						<View style={tw("mb-5 bg-gray-100 rounded-lg p-5")}>
							<Text style={tw("text-center text-sm text-gray-400 mb-3")}>Notes</Text>
							<Text
								style={tw(
									`text-center max-w-[300px] flex flex-wrap ${selectedOrder.notes ? "mb-5" : "mb-0"}`
								)}
							>
								{selectedOrder.customer.notes}
							</Text>
							<Text style={tw("text-center max-w-[300px] flex flex-wrap")}>{selectedOrder.notes}</Text>
						</View>
					) : (
						<View></View>
					)}
					{/* {orgRole && orgRole !== "org:viewer" && selectedDate == moment(new Date()).format("yyyy-MM-DD") && (
						
					)} */}
					{routeSession === null && (
						<View style={tw("bg-red-200 border border-red-400 p-3 rounded mb-5")}>
							<Text style={tw("text-xs text-red-700")}>
								Please Press "Start route" before updating status
							</Text>
						</View>
					)}
					<View style={tw("mb-5")}>
						<TextInput
							placeholder={orgRole && orgRole !== "org:viewer" ? "Type Notes" : "No notes"}
							placeholderTextColor="#999"
							value={notes}
							onChangeText={setNotes}
							style={tw(
								`text-sm rounded text-gray-700 border-b pb-2 border-gray-300 flex flex-wrap max-w-[300px] text-wrap ${
									routeSession === null ? "opacity-50" : "opacity-100"
								}`
							)}
							editable={orgRole && orgRole !== "org:viewer" && routeSession !== null ? true : false}
							multiline={true}
							numberOfLines={4}
						/>
					</View>

					<View style={tw("flex-row justify-between items-center mb-5")}>
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
										style={[
											{ backgroundColor: status.color },
											tw(
												`flex-1 rounded py-4 mx-1 ${
													!isColorDark(status.color) ? "border border-gray-200" : ""
												} ${routeSession === null ? "opacity-50" : "opacity-100"}`
											),
										]}
									>
										<Text
											style={[
												tw(
													`text-center text-${
														isColorDark(status.color) ? "white" : "gray-700"
													}`
												),
											]}
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
