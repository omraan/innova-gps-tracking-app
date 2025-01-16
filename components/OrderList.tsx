import colors from "@/colors";
import { isColorDark } from "@/lib/styles";
import { useOrder } from "@/providers/OrderProvider";
import { isArray } from "@apollo/client/utilities";
import { useAuth, useOrganization, useUser } from "@clerk/clerk-expo";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
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

	return (
		<View className="flex-1 mb-20 px-3">
			{ordersWithMissingLocation.length > 0 ? (
				<View className="flex-1">
					<View className="bg-red-200 border border-red-400 p-5 rounded mb-10">
						<Text className="text-lg font-bold text-gray-500 mb-2">
							{ordersWithMissingLocation.length} order(s) with missing location
						</Text>
						<Text className="text-md text-gray-700 mb-5">
							Please update the location of the following order(s):
						</Text>
						<View className="flex-row gap-5">
							<Text className="text-md text-gray-700">Press on</Text>
							<MaterialIcons name="edit-location-alt" size={24} color={colors.primary} />
							<Text className="text-md text-gray-700">the order to update the location.</Text>
						</View>
					</View>
					{/* <View className="mb-2 p-2">
						{ordersWithMissingLocation.map((order: CustomerOrders, index: number) => (
							<OrderListItem order={order} key={index} />
						))}
					</View> */}
				</View>
			) : (
				<View />
			)}
			<View className="pt-2">
				<Text className="text-center mb-2">
					{orders.length} order
					{orders.length !== 1 ? "s" : ""}
				</Text>

				<ScrollView horizontal className="pb-5 mb-2">
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
								className="rounded py-2 px-4"
								style={[
									{
										backgroundColor: status.color,
										opacity: !status.active ? 0.5 : 1,
										marginHorizontal: 3,
										marginVertical: 5,
									},
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
