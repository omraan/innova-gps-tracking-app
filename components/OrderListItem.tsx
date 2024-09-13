import { isColorDark } from "@/lib/styles";
import { isArray } from "@apollo/client/utilities";
import { useAuth, useOrganization, useUser } from "@clerk/clerk-expo";
import { Card } from "@rneui/themed";
import { format } from "date-fns";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome6";
import { useTailwind } from "tailwind-rn";

interface OrderExtendedWithLabels extends CustomerOrders {
	label: string;
	[key: string]: any;
}

interface publicMetadata {
	categories: {
		color: string;
		name: string;
	}[];
}

export default function OrderList({
	order,
	handleSelection,
	labels,
}: {
	order: OrderExtendedWithLabels;
	handleSelection: (order: CustomerOrders) => void;
	labels: string[];
}) {
	const tw = useTailwind();
	const { organization } = useOrganization();
	const publicMetadataOrder = organization?.publicMetadata?.order as publicMetadata;

	const statusCategory: StatusCategory = organization?.publicMetadata.statusCategories.find(
		(status) =>
			status.name &&
			(!order.customer.lat || order.customer.lat == 0
				? status.name.toLocaleLowerCase() === "no location"
				: status.name === order.status)
	) || {
		name: "unknown",
		color: "#000000",
	};

	let latestEvent: any;
	if (order.events && order.events.length > 0) {
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

	const categorisedLabels = Array.from(
		new Set(
			labels.map((label: string, index: number) => {
				const splittedLabel: string[] = label.split(".");

				if (splittedLabel.length > 1) {
					const [parent, child] = splittedLabel;
					if (parent === "customer" && (child === "streetName" || child === "streetNumber")) {
						const { streetName, streetNumber } = order.customer;
						return `${streetName} ${streetNumber || ""}`;
					} else {
						return order[parent][child];
					}
				} else if (order[label]) {
					return order[label].length > 1 ? order[label].join(" ") : order[label][0];
				}
			})
		)
	);

	return (
		<Pressable onPress={() => handleSelection(order)} style={tw("mb-4")}>
			<View
				style={[
					tw(`border border-gray-200 border-l-4 p-4 bg-white rounded`),
					{
						borderLeftWidth: 4,
						borderLeftColor: statusCategory.color,
						elevation: 2,
						shadowColor: "#000",
						shadowOffset: { width: 0, height: 4 },
						shadowOpacity: 0.05,
						shadowRadius: 3,
					},
				]}
			>
				<View style={tw("flex flex-row justify-between items-center")}>
					<View style={tw("flex-row flex-wrap")}>
						<View>
							{categorisedLabels.map((label, index) => (
								<View
									key={index}
									style={tw(`${categorisedLabels.length > 1 ? "font-semibold" : "font-normal"}`)}
								>
									<Text
										style={tw(
											`${
												categorisedLabels.length > 1 && index === 0
													? "font-semibold"
													: "font-normal"
											} ${index > 0 ? "text-xs" : ""}`
										)}
									>
										{label}
									</Text>
								</View>
							))}
						</View>
					</View>

					<View style={tw("flex-row items-center")}>
						{order.status.toLowerCase() !== "open" && (
							<View style={tw("bg-gray-200 rounded px-3 py-2 mr-2")}>
								<Text>
									{latestEvent && moment(latestEvent?.modifiedAt || "No time").format("HH:mm")}
								</Text>
							</View>
						)}
						<View style={tw("flex justify-center items-center")}>
							{order.notes && order.notes.length > 0 && (
								<FontAwesomeIcon name="message" size={16} color="#999999" />
							)}
						</View>

						<View
							style={[
								{
									backgroundColor:
										publicMetadataOrder?.categories?.find(
											(category: any) => category.name === order.category
										)?.color || "gray",
								},
								tw("rounded flex justify-center items-center mx-3 h-[24px] w-[24px]"),
							]}
						>
							<Text style={[{ color: "white" }, tw("text-xs")]}>{order.amountOrders}</Text>
						</View>
					</View>
				</View>
			</View>
		</Pressable>
	);
}
