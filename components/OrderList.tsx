import { useOrganization } from "@clerk/clerk-expo";
import { Card } from "@rneui/themed";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useTailwind } from "tailwind-rn";

export default function OrderList({
	orders,
	handleSelection,
}: {
	orders: CustomerOrders[];
	handleSelection: (order: CustomerOrders) => void;
}) {
	const tw = useTailwind();
	const { organization } = useOrganization();
	// const { userId } = useAuth();

	const statusCategories: StatusCategory[] = organization?.publicMetadata.statusCategories || [
		{
			color: "#000000",
			name: "Unknown",
		},
	];

	const ordersWithMissingLocation = orders.filter((order: OrderExtended) => Number(order.customer.lat) === 0) || [];
	const isColorDark = (color: string) => {
		const hex = color.replace("#", "");
		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 4), 16);
		const b = parseInt(hex.substring(4, 6), 16);
		// Bereken de luminantie
		const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
		return luminance < 128;
	};
	return (
		<View>
			<View style={tw("px-5 pt-5 ")}>
				<Text style={tw("text-center mb-5")}>
					{orders.length} order
					{orders.length !== 1 ? "s" : ""}
				</Text>

				<View style={tw("flex flex-row flex-wrap items-center justify-center")}>
					{statusCategories.map((status) => (
						<View
							key={status.name}
							style={[
								{
									backgroundColor: status.color,
									marginHorizontal: 5,
									marginVertical: 5,
								},
								tw("rounded py-2 px-4"),
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
					))}
				</View>
			</View>
			{orders &&
				orders
					.sort(
						(a, b) =>
							statusCategories.findIndex(
								(category) => category.name.toLowerCase() === a.status?.toLowerCase()
							) -
							statusCategories.findIndex(
								(category) => category.name.toLowerCase() === b.status?.toLowerCase()
							)
					)
					.map((order: any) => {
						return (
							<Pressable key={order.id} onPress={() => handleSelection(order)}>
								<Card
									containerStyle={[
										{
											borderLeftColor:
												statusCategories.find(
													(s: any) =>
														s.name ===
														(Number(order.customer.lat) === 0
															? "No Location"
															: order.status)
												)?.color || "#000000",
											elevation: 2,
											shadowColor: "#000",
											shadowOffset: { width: 0, height: 4 },
											shadowOpacity: 0.05,
											shadowRadius: 3,
										},
										tw("border-l-4  p-4 bg-white rounded "),
									]}
									key={order.id}
								>
									<View key={order.id} style={tw("flex flex-row justify-between items-center")}>
										<Text>{order.customer.name}</Text>
										<View
											style={{
												width: 24,
												height: 24,
												borderRadius: 12,
												backgroundColor: "gray",
												justifyContent: "center",
												alignItems: "center",
												marginLeft: 8,
											}}
										>
											<Text style={{ color: "white" }}>{order.amountOrders}</Text>
										</View>
									</View>
								</Card>
							</Pressable>
						);
					})}
		</View>
	);
}
