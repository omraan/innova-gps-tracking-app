import colors from "@/colors";
import { UPDATE_ROUTE_START_TIME } from "@/graphql/mutations";
import { useDateStore } from "@/hooks/useDateStore";
import { useVehicleStore } from "@/hooks/useVehicleStore";
import { useDispatch } from "@/providers/DispatchProvider";
import { useRoute } from "@/providers/RouteProvider";
import { useMutation, useQuery } from "@apollo/client";
import { useAuth } from "@clerk/clerk-expo";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTailwind } from "tailwind-rn";

export default function RouteSession() {
	const tw = useTailwind();

	const { selectedDate } = useDateStore();
	const { selectedVehicle } = useVehicleStore();
	const { dispatches } = useDispatch();
	const { selectedRoute, setSelectedRoute } = useRoute();

	const [UpdateRouteStartTime] = useMutation(UPDATE_ROUTE_START_TIME);

	const startRoute = async () => {
		const startTime = moment(new Date()).format("yyyy-MM-DD HH:mm:ss");

		if (!selectedDate) {
			return;
		}
		if (!selectedRoute) {
			return;
		}

		const variables = {
			date: selectedDate,
			routeId: selectedRoute?.name,
			startTime,
		};
		await UpdateRouteStartTime({
			variables,
			onCompleted: (data) => {
				setSelectedRoute({
					name: selectedRoute.name,
					value: {
						...selectedRoute.value,
						startTime,
					},
				});
			},
		});
	};

	const showButton = selectedRoute && !selectedRoute?.value.startTime && dispatches && dispatches.length > 0;
	return (
		showButton && (
			<View>
				{!selectedVehicle ? (
					<View className="flex-col items-center justify-center mb-2">
						<View className="bg-white px-4 py-2 rounded flex-row gap-2 items-center">
							<Text>Navigate to </Text>
							<View className="rounded-full border border-primary p-2">
								<MaterialIcons name="settings" size={16} color={colors.primary} />
							</View>
							<Text>to select a vehicle</Text>
						</View>
						<AntDesign name="caretdown" size={12} color="white" style={{ marginTop: -4 }} />
					</View>
				) : (
					<View />
				)}
				<View style={tw("flex flex-row items-center justify-center")}>
					<Pressable
						onPress={startRoute}
						className="bg-white py-3 px-5 rounded flex-row gap-3 items-center justify-between"
						style={{
							width: 150,
							marginHorizontal: "auto",
							opacity: !selectedDate || !selectedVehicle ? 0.5 : 1,
						}}
					>
						<Text className="text-center text-secondary text-lg font-semibold">Start Route</Text>
						<AntDesign name="caretright" size={14} color="#6366f1" />
					</Pressable>
				</View>
			</View>
		)
	);
}
