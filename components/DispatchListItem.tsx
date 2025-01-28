import colors from "@/colors";
import { useDispatch } from "@/providers/DispatchProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { useOrganization } from "@clerk/clerk-expo";
import Entypo from "@expo/vector-icons/Entypo";
import moment from "moment";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome6";

export default function DispatchListItem({ dispatch }: { dispatch: { name: string; value: DispatchExtended } }) {
	const { organization } = useOrganization();
	const { setSelectedDispatch } = useDispatch();
	const { setActiveSheet } = useSheetContext();

	const statusCategory: StatusCategory = organization?.publicMetadata.statusCategories.find(
		(status) =>
			status.name &&
			dispatch &&
			(!dispatch.value.customer.lat || dispatch.value.customer.lat == 0
				? status.name.toLocaleLowerCase() === "no location"
				: status.name === dispatch.value.status)
	) || {
		name: "unknown",
		color: "#000000",
	};

	let latestEvent: any;
	if (dispatch && dispatch.value.events && dispatch.value.events.length > 0) {
		latestEvent = dispatch.value.events.reduce((latestEvent: any, currentEvent: any) => {
			if (
				currentEvent.status &&
				(!latestEvent || new Date(currentEvent.modifiedAt) > new Date(latestEvent.modifiedAt))
			) {
				return currentEvent;
			}
			return latestEvent;
		});
	}

	if (!dispatch) return null;

	return (
		<View>
			<View
				style={{
					flex: 1,
					flexDirection: "row",
					justifyContent: "space-between",
					gap: 5,
					alignItems: "center",
				}}
			>
				<View style={{ flex: 1, gap: 5 }}>
					<View style={{ flex: 1, flexDirection: "row", gap: 5, alignItems: "center" }}>
						<View
							className="rounded mr-2"
							style={[
								{
									width: 18,
									height: 18,
									backgroundColor: statusCategory.color,
								},
							]}
						/>
						<Text className="text-black font-bold" style={{ fontSize: 20 }}>
							{dispatch.value.customer.name}
						</Text>
					</View>

					<Text style={{ color: "gray", fontSize: 18 }}>
						{dispatch.value.orders && dispatch.value.orders.length > 0
							? dispatch.value.orders.map((o) => o.orderNumber).join(" · ")
							: "No order number"}
					</Text>
					<Text style={{ color: "gray", fontSize: 18 }}>
						{dispatch.value.customer.streetName} {dispatch.value.customer.streetNumber}
					</Text>
				</View>

				<View className="flex-row items-center">
					{!["open", "no location"].includes(dispatch.value.status.toLowerCase()) && (
						<View className="bg-gray-200 rounded px-3 py-2 mr-2">
							<Text>
								{latestEvent &&
									moment(latestEvent?.modifiedAt || latestEvent?.createdAt || "No time").format(
										"HH:mm"
									)}
							</Text>
						</View>
					)}
					<View className="flex justify-center items-center">
						{dispatch.value.notes && dispatch.value.notes.length > 0 && (
							<FontAwesomeIcon name="message" size={16} color="#999999" />
						)}
					</View>

					<TouchableOpacity
						className="rounded flex justify-center items-center p-3"
						onPress={() => {
							setActiveSheet("dispatches");
							setSelectedDispatch(dispatch);
						}}
					>
						<Entypo name="dots-three-horizontal" size={24} color={colors.primary} />
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}
