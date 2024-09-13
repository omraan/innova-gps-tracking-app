import { CREATE_ROUTE_SESSION, UPDATE_ROUTE_SESSION } from "@/graphql/mutations";
import { GET_ROUTE_SESSIONS } from "@/graphql/queries";
import { useDateStore } from "@/hooks/useDateStore";
import { useRouteSessionStore } from "@/hooks/useRouteSessionStore";
import { useVehicleStore } from "@/hooks/useVehicleStore";
import { useMutation, useQuery } from "@apollo/client";
import { useAuth } from "@clerk/clerk-expo";
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

	const [CreateRouteSession] = useMutation(CREATE_ROUTE_SESSION);
	const [UpdateRouteSession] = useMutation(UPDATE_ROUTE_SESSION);

	const startRoute = async () => {
		const startTime = Date.now();

		if (!selectedDate) {
		}
		if (!selectedVehicle) {
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

	const endRoute = async () => {
		const variables = {
			id: routeSession?.id!,
			date: selectedDate,
			endTime: moment(new Date()).format("yyyy-MM-DD HH:mm:ss"),
		};
		await UpdateRouteSession({
			variables,
		});
		setRouteSession(null);
	};

	return (
		<View
			style={tw(
				`w-full py-2 px-5 flex-row justify-${
					routeSession ? "between" : "center"
				} items-center fixed bg-black/80 max-h-[50px]`
			)}
		>
			{routeSession ? (
				<>
					<Pressable onPress={endRoute} style={tw("bg-white py-2 px-4 rounded")}>
						<Text style={tw("text-xs text-gray-600 font-bold")}>End Route</Text>
					</Pressable>
				</>
			) : (
				<Pressable onPress={startRoute} style={tw("bg-white py-2 px-4 rounded")}>
					<Text style={tw("text-xs text-gray-600 font-bold")}>Start Route</Text>
				</Pressable>
			)}
		</View>
	);
}
