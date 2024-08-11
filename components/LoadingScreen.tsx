import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTailwind } from "tailwind-rn";

export default function LoadingScreen({ loading = false }: { loading: boolean }) {
	const tw = useTailwind();
	if (!loading) return null;
	return (
		<View style={tw("absolute w-full h-full z-[99999] bg-white/80")}>
			<View style={tw("flex flex-col justify-center items-center p-10 h-full")}>
				<ActivityIndicator size="large" color="#A9A9A9" style={tw("mb-5")} />
				<Text>Loading...</Text>
			</View>
		</View>
	);
}
