import colors from "@/colors";
import { useLocation } from "@/providers/LocationProvider";
import { useOrder } from "@/providers/OrderProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { useOrganization } from "@clerk/clerk-expo";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import moment from "moment";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome6";

export default function OrderListItem({ order }: { order: CustomerOrders }) {
	const { organization } = useOrganization();
	const { setSelectedOrder } = useOrder();
	const { setActiveSheet } = useSheetContext();

	const { isChangingLocation, setIsChangingLocation } = useLocation();

	const statusCategory: StatusCategory = organization?.publicMetadata.statusCategories.find(
		(status) =>
			status.name &&
			order &&
			(!order.customer.lat || order.customer.lat == 0
				? status.name.toLocaleLowerCase() === "no location"
				: status.name === order.status)
	) || {
		name: "unknown",
		color: "#000000",
	};

	let latestEvent: any;
	if (order && order.events && order.events.length > 0) {
		latestEvent = order.events.reduce((latestEvent: any, currentEvent: any) => {
			if (
				currentEvent.status &&
				(!latestEvent || new Date(currentEvent.modifiedAt) > new Date(latestEvent.modifiedAt))
			) {
				return currentEvent;
			}
			return latestEvent;
		});
	}

	return (
		order && (
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
								{order.customer.name}
							</Text>
							{!["open", "no location"].includes(order.status.toLowerCase()) ? (
								<View
									className="rounded px-3 py-1 mr-2"
									style={{ backgroundColor: statusCategory.color }}
								>
									<Text className="text-white text-sm">
										{latestEvent &&
											moment(
												latestEvent?.modifiedAt || latestEvent?.createdAt || "No time"
											).format("HH:mm")}
									</Text>
								</View>
							) : (
								<View
									className="rounded px-3 py-1 mr-2"
									style={{ backgroundColor: statusCategory.color }}
								>
									<Text className="text-white text-sm">{statusCategory.name}</Text>
								</View>
							)}
						</View>

						<Text style={{ color: "gray", fontSize: 18 }}>
							{order.orderNumbers && order.orderNumbers.length > 0
								? order.orderNumbers.join(" · ")
								: "No order number"}
						</Text>
						<Text style={{ color: "gray", fontSize: 18 }}>
							{order.customer.streetName} {order.customer.streetNumber}
						</Text>
					</View>

					<View className="flex-row items-center">
						<View className="flex justify-center items-center">
							{order.notes && order.notes.length > 0 && (
								<FontAwesomeIcon name="message" size={16} color="#999999" />
							)}
						</View>

						<TouchableOpacity
							className="rounded flex justify-center items-center p-3"
							onPress={() => {
								// setActiveSheet("orders");
								setSelectedOrder(order);
								if (order.customer.lat === 0) {
									setIsChangingLocation(true);
									setActiveSheet(null);
								} else {
									setActiveSheet("orders");
								}
							}}
						>
							{order.customer.lat === 0 ? (
								<MaterialIcons name="edit-location-alt" size={24} color={colors.primary} />
							) : (
								<Entypo name="dots-three-horizontal" size={24} color={colors.primary} />
							)}
						</TouchableOpacity>
					</View>
				</View>
			</View>
		)
	);
}
