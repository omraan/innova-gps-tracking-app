import colors from "@/colors";
import { isColorDark } from "@/lib/styles";
import { useDispatch } from "@/providers/DispatchProvider";
import { useMetadata } from "@/providers/MetaDataProvider";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import DispatchListItem from "./DispatchListItem";

export default function DispatchList() {
	const { dispatches } = useDispatch();
	const { statusCategories } = useMetadata();
	const [selectedStatusCategories, setSelectedStatusCategories] = useState<StatusCategory[] | null>();

	useEffect(() => {
		if (statusCategories) {
			setSelectedStatusCategories(statusCategories.map((category) => ({ ...category, active: true })));
		}
	}, [statusCategories]);

	const dispatchesWithMissingLocation =
		dispatches.filter((dispatch) => Number(dispatch.value.customer.lat) === 0) || [];

	return (
		<View className="flex-1 mb-20 px-3">
			{dispatchesWithMissingLocation.length > 0 ? (
				<View className="flex-1">
					<View className="bg-red-200 border border-red-400 p-5 rounded mb-10">
						<Text className="text-lg font-bold text-gray-500 mb-2">
							{dispatchesWithMissingLocation.length} order(s) with missing location
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
					{dispatches.length} dispatch
					{dispatches.length !== 1 ? "es" : ""}
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
											? dispatchesWithMissingLocation.length
											: dispatches.filter((dispatch) => dispatch.value.status === status.name)
													.length}{" "}
										{status.name}
									</Text>
								</View>
							</Pressable>
						))}
				</ScrollView>
			</View>

			<View style={{ flex: 1, flexDirection: "column", gap: 20 }}>
				{dispatches &&
					dispatches.length > 0 &&
					// labels &&
					dispatches
						.filter((dispatch) => {
							const dispatchNoLocation = Number(dispatch.value.customer.lat) === 0;
							if (
								dispatchNoLocation &&
								dispatch.value.status?.toLowerCase() === "open" &&
								selectedStatusCategories &&
								selectedStatusCategories.find(
									(status) => status.active && status.name === "No Location"
								)
							) {
								return true;
							}

							const status =
								selectedStatusCategories &&
								selectedStatusCategories.find((s) => s.name === dispatch.value.status);
							return status?.active ?? false;
						})
						.map((dispatch, index: number) => <DispatchListItem dispatch={dispatch} key={index} />)}
			</View>
		</View>
	);
}
