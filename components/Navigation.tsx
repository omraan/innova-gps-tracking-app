import colors from "@/colors";
import { useDispatch } from "@/providers/DispatchProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "./SearchBar";

export default function Navigation() {
	const { setActiveSheet } = useSheetContext();

	const { dispatches } = useDispatch();

	const dispatchCount = dispatches.filter(
		(dispatch) => !dispatch.value.customer.lat || dispatch.value.customer.lat === 0
	).length;

	return (
		<SafeAreaView className="absolute top-0 left-0 right-0">
			<View className="flex-row justify-between gap-5 px-6 items-start">
				<Pressable
					className="bg-white rounded-full p-4 m-auto shadow shadow-black/20"
					onPress={() => setActiveSheet("account")}
				>
					<MaterialIcons name="person" size={24} color={colors.primary} />
				</Pressable>
				<SearchBar />

				<View className="flex-column gap-8 justify-between">
					<Pressable
						className="bg-white rounded-full p-4 shadow shadow-black/20"
						onPress={() => setActiveSheet("settings")}
					>
						<MaterialIcons name="settings" size={24} color={colors.primary} />
					</Pressable>
				</View>
			</View>
			<View className="flex-row justify-end px-6 py-6">
				<View className="relative">
					<Pressable
						className="bg-white rounded-full p-4 shadow shadow-black/20"
						onPress={() => setActiveSheet("route")}
					>
						<MaterialIcons name="route" size={24} color={colors.primary} />
					</Pressable>
					{dispatchCount > 0 && (
						<View className="w-6 h-6 bg-red-500 rounded-full absolute top-0 -right-2 z-10">
							<View className="flex-row justify-center items-center h-full w-full">
								<Text className="text-white text-xs text-center font-bold">{dispatchCount}</Text>
							</View>
						</View>
					)}
				</View>
			</View>
		</SafeAreaView>
	);
}
