import { useRouteSessionStore } from "@/hooks/useRouteSessionStore";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTailwind } from "tailwind-rn";
export default function RouteSession() {
	const tw = useTailwind();

	const { routeSession, setRouteSession } = useRouteSessionStore();
	const [timer, setTimer] = useState(0);
	const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

	const startRoute = () => {
		const startTime = Date.now();
		setTimer(0);
		setRouteSession({ startTime, active: true });
		const id = setInterval(() => {
			setTimer(Date.now() - startTime);
		}, 1000);
		setIntervalId(id);
	};

	const endRoute = () => {
		if (intervalId) {
			clearInterval(intervalId);
		}
		setRouteSession({ startTime: routeSession?.startTime!, endTime: Date.now(), active: false });
		setIntervalId(null);
	};

	useEffect(() => {
		if (routeSession?.active && !intervalId) {
			console.log("hello");
			const id = setInterval(() => {
				setTimer(Date.now() - routeSession.startTime);
			}, 1000);
			setIntervalId(id);
		}

		return () => {
			if (intervalId) {
				clearInterval(intervalId);
				setIntervalId(null);
			}
		};
	}, [routeSession, intervalId]);

	const formatTime = (milliseconds: number) => {
		const totalSeconds = Math.floor(milliseconds / 1000);
		const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
		const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
		const seconds = String(totalSeconds % 60).padStart(2, "0");
		return `${hours}:${minutes}:${seconds}`;
	};

	return (
		<View
			style={tw(
				`w-full py-2 px-5 flex-row justify-${
					routeSession?.active ? "between" : "center"
				} items-center fixed bg-black/80 max-h-[50px]`
			)}
		>
			{routeSession?.active ? (
				<>
					<Text style={tw("text-white")}>{formatTime(timer)}</Text>
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
