import { isColorDark } from "@/lib/styles";
import { useDispatch } from "@/providers/DispatchProvider";
import { useMetadata } from "@/providers/MetaDataProvider";
import { isArray } from "@apollo/client/utilities";
import { useAuth, useOrganization, useUser } from "@clerk/clerk-expo";
import { Card } from "@rneui/themed";
import { format } from "date-fns";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTailwind } from "tailwind-rn";
import DispatchListItem from "./DispatchListItem";

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

export default function DispatchList() {
	const { organization } = useOrganization();

	const { user } = useUser();
	const { orgId } = useAuth();

	const { dispatches } = useDispatch();
	const { statusCategories } = useMetadata();

	const [selectedStatusCategories, setSelectedStatusCategories] = useState<StatusCategory[] | null>();

	useEffect(() => {
		if (statusCategories) {
			setSelectedStatusCategories(statusCategories.map((category) => ({ ...category, active: true })));
		}
	}, [statusCategories]);

	const [labels, setLabels] = useState<string[]>([]);
	useEffect(() => {
		if (user && orgId && user?.unsafeMetadata?.organizations && user?.unsafeMetadata?.organizations[orgId]) {
			setLabels(user.unsafeMetadata.organizations[orgId].labels || ["customer.name"]);
		}
	}, [user, orgId]);

	const ordersWithMissingLocation = dispatches.filter((dispatch) => Number(dispatch.value.customer.lat) === 0) || [];

	return (
		<View className="flex-1 mb-20 px-3">
			<View className=" pt-2 ">
				<Text className="text-center mb-2">
					{dispatches.length} order
					{dispatches.length !== 1 ? "s" : ""}
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
											? ordersWithMissingLocation.length
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
					labels &&
					dispatches
						.filter((dispatch) => {
							const dispatchNoLocation = Number(dispatch.value.customer.lat) === 0;
							if (
								dispatchNoLocation &&
								dispatch.value.status?.toLowerCase() === "open" &&
								statusCategories &&
								statusCategories.find((status) => status.active && status.name === "No Location")
							) {
								return true;
							}

							const status =
								statusCategories && statusCategories.find((s) => s.name === dispatch.value.status);
							return status?.active ?? false;
						})
						.map((dispatch, index: number) => <DispatchListItem dispatch={dispatch} key={index} />)}
			</View>
		</View>
	);
}
