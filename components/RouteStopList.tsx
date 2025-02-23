import colors from "@/colors";
import { useSelectionStore } from "@/hooks/useSelectionStore";
import { isColorDark } from "@/lib/styles";
import { useMetadata } from "@/providers/MetaDataProvider";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import RouteStopListItem from "./RouteStopListItem";

export default function RouteStopList() {
	const { selectedRoute } = useSelectionStore();
	const { statusCategories } = useMetadata();
	const [selectedStatusCategories, setSelectedStatusCategories] = useState<StatusCategory[] | null>();

	useEffect(() => {
		if (statusCategories) {
			setSelectedStatusCategories(statusCategories.map((category) => ({ ...category, active: true })));
		}
	}, [statusCategories]);

	const routeStopsWithMissingLocation =
		selectedRoute?.value.stops.filter((routeStop) => Number(routeStop.value.location.latitude) === 0) || [];

	return (
		<View className="flex-1 mb-20 px-3">
			{routeStopsWithMissingLocation.length > 0 ? (
				<View className="flex-1">
					<View className="bg-red-200 border border-red-400 p-5 rounded mb-10">
						<Text className="text-lg font-bold text-gray-500 mb-2">
							{routeStopsWithMissingLocation.length} order(s) with missing location
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
						{dispatchesWithMissingLocation.map((order: CustomerOrders, index: number) => (
							<OrderListItem order={order} key={index} />
						))}
					</View> */}
				</View>
			) : (
				<View />
			)}
			<View className=" pt-2 ">
				<Text className="text-center mb-2">
					{selectedRoute?.value.stops.length} stop
					{selectedRoute?.value.stops.length !== 1 ? "s" : ""}
				</Text>

				<ScrollView horizontal className="pb-5 mb-2">
					{selectedStatusCategories &&
						selectedStatusCategories.map((status, index) => (
							<Pressable
								key={index}
								onPress={() => {
									const newStatusCategories = selectedStatusCategories.map((category) =>
										category.name === status.name
											? { ...category, active: !category.active }
											: category
									);
									setSelectedStatusCategories(newStatusCategories);
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
											? routeStopsWithMissingLocation.length
											: selectedRoute?.value.stops.filter(
													(routeStop) => routeStop.value.status === status.name
											  ).length}{" "}
										{status.name}
									</Text>
								</View>
							</Pressable>
						))}
				</ScrollView>
			</View>

			<View style={{ flex: 1, flexDirection: "column", gap: 20 }}>
				{selectedRoute?.value.stops &&
					selectedRoute?.value.stops.length > 0 &&
					// labels &&
					selectedRoute?.value.stops
						.filter((routeStop) => {
							const routeStopNoLocation = Number(routeStop.value.location.latitude) === 0;
							if (
								routeStopNoLocation &&
								routeStop.value.status?.toLowerCase() === "open" &&
								selectedStatusCategories &&
								selectedStatusCategories.find(
									(status) => status.active && status.name === "No Location"
								)
							) {
								return true;
							}

							const status =
								selectedStatusCategories &&
								selectedStatusCategories.find((s) => s.name === routeStop.value.status);
							return status?.active ?? false;
						})
						.map((routeStop, index: number) => <RouteStopListItem routeStop={routeStop} key={index} />)}
			</View>
		</View>
	);
}
