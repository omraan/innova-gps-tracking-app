import colors from "@/colors";
import { useNavigationStore } from "@/hooks/useNavigationStore";
import { useSelectionStore } from "@/hooks/useSelectionStore";
import { useLocation } from "@/providers/LocationProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "./SearchBar";

export default function Navigation() {
	const { setActiveSheet } = useSheetContext();
	const { activeNavigateOption, setActiveNavigateOption } = useNavigationStore();

	const { followUserLocation, setFollowUserLocation } = useLocation();
	const { selectedRoute } = useSelectionStore();

	const routeStopCount = selectedRoute?.value.stops.filter(
		(routeStop) => !routeStop.value.location.latitude || routeStop.value.location.latitude === 0
	).length;

	const navigateOptions: NavigationOption[] = [
		{
			name: "locate-dispatch",
			iconName: "search-location",
			iconObject: FontAwesome5,
			iconSize: 24,
		},
		{
			name: "locate-route",
			iconName: "route",
			iconObject: FontAwesome5,
			iconSize: 24,
		},
		{
			name: "locate-user",
			iconName: "locate-sharp",
			iconObject: Ionicons,
			iconSize: 24,
		},
		{
			name: "navigate",
			iconName: "navigation",
			iconObject: MaterialIcons,
			iconSize: 24,
			className: "rotate-45",
		},
	];

	const [showOptions, setShowOptions] = useState<boolean>(false);

	const activeOption = navigateOptions.find((o) => o.name == activeNavigateOption);

	return (
		<SafeAreaView className="absolute top-2 left-0 right-0">
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
					{routeStopCount > 0 && (
						<View className="w-6 h-6 bg-red-500 rounded-full absolute top-0 -right-2 z-10">
							<View className="flex-row justify-center items-center h-full w-full">
								<Text className="text-white text-xs text-center font-bold">{routeStopCount}</Text>
							</View>
						</View>
					)}
				</View>
			</View>
			<View className="flex-row justify-end px-6">
				<View className="flex-row gap-5 bg-white rounded-full p-4 shadow shadow-black/20 ">
					{showOptions && (
						<>
							{navigateOptions.map((item, index) => (
								<item.iconObject
									key={index}
									size={item.iconSize}
									color={activeNavigateOption === item.name ? colors.primary : "gray"}
									name={item.iconName}
									className={item.className}
									onPress={() => {
										setActiveNavigateOption(item.name);
									}}
								/>
							))}
							<View className="border border-gray-200" />
						</>
					)}

					<TouchableOpacity
						className=""
						onPress={() => {
							setShowOptions(!showOptions);
						}}
					>
						{activeOption && (
							<activeOption.iconObject
								size={activeOption.iconSize}
								color={colors.primary}
								name={activeOption.iconName}
								className={`${activeOption.className}`}
							/>
						)}
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	);
}
