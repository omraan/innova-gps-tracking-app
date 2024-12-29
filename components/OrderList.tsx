import { isColorDark } from "@/lib/styles";
import { useOrder } from "@/providers/OrderProvider";
import { isArray } from "@apollo/client/utilities";
import { useAuth, useOrganization, useUser } from "@clerk/clerk-expo";
import { Card } from "@rneui/themed";
import { format } from "date-fns";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTailwind } from "tailwind-rn";
import OrderListItem from "./OrderListItem";

interface StatusCategoryFilter extends StatusCategory {
	active: boolean;
}

interface OrderExtendedWithLabels extends OrderExtended {
	label: string;
}

interface publicMetadata {
	categories: {
		color: string;
		name: string;
	}[];
}

export default function OrderList() {
	const tw = useTailwind();
	const { organization } = useOrganization();

	const { user } = useUser();
	const { orgId } = useAuth();

	const { orders } = useOrder();

	const [sortType, setSortType] = useState<"status" | "alphabetical" | "route">("status");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

	const [statusCategories, setStatusCategories] = useState<StatusCategoryFilter[]>([]);

	useEffect(() => {
		setStatusCategories(
			organization?.publicMetadata.statusCategories.map((status) => {
				return {
					...status,
					active: true,
				};
			}) || [
				{
					color: "#000000",
					name: "Unknown",
					active: true,
				},
			]
		);
	}, [orgId]);

	const [labels, setLabels] = useState<string[]>([]);
	useEffect(() => {
		if (user && orgId && user?.unsafeMetadata?.organizations && user?.unsafeMetadata?.organizations[orgId]) {
			setLabels(user.unsafeMetadata.organizations[orgId].labels || ["customer.name"]);
		}
	}, [user, orgId]);

	const ordersWithMissingLocation = orders.filter((order: CustomerOrders) => Number(order.customer.lat) === 0) || [];

	// const sortOrders = (orders: CustomerOrders[]) => {
	// 	const ordersWithLabels = orders.map((order: any) => {
	// 		const label = labels.map((label) => {
	// 			const splittedLabel = label.split(".");
	// 			if (splittedLabel.length > 1) {
	// 				return order[splittedLabel[0]][splittedLabel[1]] + " ";
	// 			}
	// 			if (order[label]) {
	// 				return order[label].length > 1 ? order[label].join(" ") : order[label][0];
	// 			}
	// 		});
	// 		return { ...order, label: label.join(" ") };
	// 	});

	// 	return ordersWithLabels.sort((a, b) => {
	// 		if (sortType === "status") {
	// 			const latA = Number(a.customer.lat);
	// 			const latB = Number(b.customer.lat);

	// 			if (sortOrder === "asc") {
	// 				if (latA === 0 && latB !== 0) return 1;
	// 				if (latA !== 0 && latB === 0) return -1;
	// 				if (latA === 0 && latB === 0) return 0;
	// 			} else {
	// 				if (latA === 0 && latB !== 0) return -1;
	// 				if (latA !== 0 && latB === 0) return 1;
	// 				if (latA === 0 && latB === 0) return 0;
	// 			}
	// 			const statusA = statusCategories.findIndex(
	// 				(category) => category.name.toLowerCase() === a.status?.toLowerCase()
	// 			);
	// 			const statusB = statusCategories.findIndex(
	// 				(category) => category.name.toLowerCase() === b.status?.toLowerCase()
	// 			);
	// 			return sortOrder === "asc" ? statusA - statusB : statusB - statusA;
	// 		} else {
	// 			const nameA = a.customer.name.toLowerCase();
	// 			const nameB = b.customer.name.toLowerCase();
	// 			if (nameA < nameB) return sortOrder === "asc" ? -1 : 1;
	// 			if (nameA > nameB) return sortOrder === "asc" ? 1 : -1;
	// 			return 0;
	// 		}
	// 	});
	// };
	return (
		<View style={tw("flex-1 mb-20 px-3")}>
			<View style={tw(" pt-2 ")}>
				<Text style={tw("text-center mb-2")}>
					{orders.length} order
					{orders.length !== 1 ? "s" : ""}
				</Text>

				<ScrollView horizontal style={tw("pb-5 mb-2")}>
					{statusCategories.map((status, index) => (
						<Pressable
							key={index}
							onPress={() => {
								const newStatusCategories = statusCategories.map((category) =>
									category.name === status.name ? { ...category, active: !category.active } : category
								);
								setStatusCategories(newStatusCategories);
							}}
						>
							<View
								style={[
									{
										backgroundColor: status.color,
										opacity: !status.active ? 0.5 : 1,
										marginHorizontal: 3,
										marginVertical: 5,
									},
									tw(`rounded py-2 px-4`),
								]}
							>
								<Text
									style={[
										{
											color: isColorDark(status.color) ? "white" : "black",
										},
									]}
								>
									{status.name === "No Location"
										? ordersWithMissingLocation.length
										: orders.filter((order) => order.status === status.name).length}{" "}
									{status.name}
								</Text>
							</View>
						</Pressable>
					))}
				</ScrollView>
			</View>

			<View style={{ flex: 1, flexDirection: "column", gap: 20 }}>
				{orders &&
					orders.length > 0 &&
					labels &&
					// sortOrders(orders)
					orders
						.filter((order: CustomerOrders) => {
							const orderNoLocation = Number(order.customer.lat) === 0;
							if (
								orderNoLocation &&
								order.status?.toLowerCase() === "open" &&
								statusCategories.find((status) => status.active && status.name === "No Location")
							) {
								return true;
							}

							const status = statusCategories.find((s) => s.name === order.status);
							return status?.active ?? false;
						})
						.map((order: CustomerOrders, index: number) => <OrderListItem order={order} key={index} />)}
			</View>
		</View>
	);
}
