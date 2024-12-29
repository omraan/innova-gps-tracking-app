import colors from "@/colors";
import { useOrder } from "@/providers/OrderProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { useOrganization } from "@clerk/clerk-expo";
import Entypo from "@expo/vector-icons/Entypo";
import moment from "moment";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome6";
import { useTailwind } from "tailwind-rn";

interface publicMetadata {
	categories: {
		color: string;
		name: string;
	}[];
}

export default function OrderListItem({
	order,
}: // handleSelection,
// labels,
{
	order: CustomerOrders;
	// handleSelection: (order: CustomerOrders) => void;
	// labels: string[];
}) {
	const tw = useTailwind();
	const { organization } = useOrganization();
	const { setSelectedOrder } = useOrder();
	const { setActiveSheet } = useSheetContext();

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

	// const categorisedLabels = Array.from(
	// 	new Set(
	// 		labels.map((label: string, index: number) => {
	// 			const splittedLabel: string[] = label.split(".");

	// 			if (splittedLabel.length > 1) {
	// 				const [parent, child] = splittedLabel;
	// 				if (parent === "customer" && (child === "streetName" || child === "streetNumber")) {
	// 					const { streetName, streetNumber } = order.customer;
	// 					return `${streetName} ${streetNumber || ""}`;
	// 				} else {
	// 					return order[parent][child];
	// 				}
	// 			} else if (order[label]) {
	// 				return order[label].length > 1 ? order[label].join(" ") : order[label][0];
	// 			}
	// 		})
	// 	)
	// );

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
						<View style={{ flex: 1, flexDirection: "row", gap: 5, alignItems: "center" }}>
							<View
								style={[
									tw("rounded p-2 mr-2 w-[5px] h-[5px]"),
									{
										backgroundColor: statusCategory.color,
										// borderWidth: 1,
										// borderColor: isColorDark(statusCategory.color) ? "white" : "black",
									},
								]}
							/>
							<View>
								<Text style={{ color: "black", fontSize: 20, fontWeight: "600" }}>
									{order.customer.name}
								</Text>
							</View>
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

					<View style={tw("flex-row items-center")}>
						{order.status.toLowerCase() !== "open" && (
							<View style={tw("bg-gray-200 rounded px-3 py-2 mr-2")}>
								<Text>
									{latestEvent &&
										moment(latestEvent?.modifiedAt || latestEvent?.createdAt || "No time").format(
											"HH:mm"
										)}
								</Text>
							</View>
						)}
						<View style={tw("flex justify-center items-center")}>
							{order.notes && order.notes.length > 0 && (
								<FontAwesomeIcon name="message" size={16} color="#999999" />
							)}
						</View>

						<TouchableOpacity
							style={[
								tw("rounded flex justify-center items-center p-3"),
								// { backgroundColor: "#eeeeee" },
							]}
							onPress={() => {
								setActiveSheet("orders");
								setSelectedOrder(order);
							}}
						>
							<Entypo name="dots-three-horizontal" size={24} color={colors.primary} />
						</TouchableOpacity>
					</View>
				</View>
			</View>
		)
	);
}
