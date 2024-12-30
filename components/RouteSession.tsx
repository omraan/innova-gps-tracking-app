import colors from "@/colors";
import { CREATE_ROUTE_SESSION, UPDATE_ROUTE_SESSION } from "@/graphql/mutations";
import { GET_ROUTE_SESSIONS } from "@/graphql/queries";
import { useDateStore } from "@/hooks/useDateStore";
import { useRouteSessionStore } from "@/hooks/useRouteSessionStore";
import { useVehicleStore } from "@/hooks/useVehicleStore";
import { useOrder } from "@/providers/OrderProvider";
import { useMutation, useQuery } from "@apollo/client";
import { useAuth } from "@clerk/clerk-expo";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTailwind } from "tailwind-rn";

export default function RouteSession() {
	const tw = useTailwind();

	const { routeSession, setRouteSession } = useRouteSessionStore();
	const { userId } = useAuth();
	const { selectedDate } = useDateStore();
	const { selectedVehicle } = useVehicleStore();
	const { orders } = useOrder();
	const [CreateRouteSession] = useMutation(CREATE_ROUTE_SESSION);

	const startRoute = async () => {
		const startTime = Date.now();

		if (!selectedDate) {
			return;
		}
		if (!selectedVehicle) {
			return;
		}

		const variables = {
			date: selectedDate,
			vehicleId: selectedVehicle?.name,
			driverId: userId,
			startTime: moment(new Date()).format("yyyy-MM-DD HH:mm:ss"),
		};
		await CreateRouteSession({
			variables,
			onCompleted: (data) => {
				const routeSessionId = data?.insertRouteSession?.name;
				setRouteSession({ id: routeSessionId, startTime });
			},
		});
	};

	const showButton =
		!routeSession && selectedDate === moment(new Date()).format("YYYY-MM-DD") && orders && orders.length > 0;
	console.log("selectedVehicle", selectedVehicle);
	return (
		showButton && (
			<View>
				{!selectedVehicle ? (
					<View className="flex-col items-center justify-center mb-2">
						<View className="bg-white px-4 py-2 rounded flex-row gap-2 items-center">
							<Text>Navigate to </Text>
							<View className="rounded-full border border-secondary p-2">
								<MaterialIcons name="settings" size={16} color={colors.secondary} />
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
