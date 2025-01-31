import colors from "@/colors";
import { useDispatch } from "@/providers/DispatchProvider";
import { useLocation } from "@/providers/LocationProvider";
import { useMetadata } from "@/providers/MetaDataProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { useOrganization } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import moment from "moment";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome6";

export default function DispatchListItem({ dispatch }: { dispatch: { name: string; value: DispatchExtended } }) {
	const { organization } = useOrganization();
	const { setSelectedDispatch } = useDispatch();
	const { setActiveSheet } = useSheetContext();

	const { statusCategories } = useMetadata();
	const { setIsChangingLocation } = useLocation();

	const statusCategory: StatusCategory = statusCategories?.find(
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

	const orderNumbers = dispatch.value.orders?.map((o) => o.orderNumber).filter(Boolean);

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
					<View style={{ flex: 1, flexDirection: "row", gap: 10, alignItems: "center" }}>
						<Text className="text-black font-bold" style={{ fontSize: 20 }}>
							{dispatch.value.customer.name}
						</Text>
						{!["open", "no location"].includes(dispatch.value.status.toLowerCase()) ? (
							<View className="rounded px-3 py-1 mr-2" style={{ backgroundColor: statusCategory.color }}>
								<Text className="text-white text-sm">
									{moment(new Date(dispatch.value.modifiedAt ? dispatch.value.modifiedAt : 0)).format(
										"HH:mm"
									)}
								</Text>
							</View>
						) : (
							<View className="rounded px-3 py-1 mr-2" style={{ backgroundColor: statusCategory.color }}>
								<Text className="text-white text-sm">{statusCategory.name}</Text>
							</View>
						)}
					</View>

					<Text style={{ color: "gray", fontSize: 18 }}>
						{orderNumbers && orderNumbers.length > 0 ? orderNumbers.join(" · ") : "No order number"}
					</Text>
					<Text style={{ color: "gray", fontSize: 18 }}>
						{dispatch.value.customer.streetName} {dispatch.value.customer.streetNumber}
					</Text>
				</View>

				<View className="flex-row items-center">
					<View className="flex justify-center items-center">
						{dispatch.value.notes && dispatch.value.notes.length > 0 && (
							<FontAwesomeIcon name="message" size={16} color="#999999" />
						)}
					</View>

					<TouchableOpacity
						className="rounded flex justify-center items-center p-3"
						onPress={() => {
							// setActiveSheet("orders");
							setSelectedDispatch(dispatch);
							if (dispatch.value.customer.lat === 0) {
								setIsChangingLocation(true);
								setActiveSheet(null);
							} else {
								setActiveSheet("dispatches");
							}
						}}
					>
						{dispatch.value.customer.lat === 0 ? (
							<MaterialIcons name="edit-location-alt" size={24} color={colors.primary} />
						) : (
							<Entypo name="dots-three-horizontal" size={24} color={colors.primary} />
						)}
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}
