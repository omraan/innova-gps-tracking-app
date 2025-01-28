import colors from "@/colors";
import AccountSheet from "@/components/AccountSheet";
import Map from "@/components/mapbox/Map";
import Navigation from "@/components/Navigation";
import RouteSession from "@/components/RouteSession";
import RouteSheet from "@/components/RouteSheet";
import SearchBar from "@/components/SearchBar";
import SelectedDispatchSheet from "@/components/SelectedDispatchSheet";
import SettingsSheet from "@/components/SettingsSheet";
import DispatchProvider from "@/providers/DispatchProvider";
import { useLocation } from "@/providers/LocationProvider";
import { MetaDataProvider } from "@/providers/MetaDataProvider";
import { RouteProvider } from "@/providers/RouteProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { SignedIn } from "@clerk/clerk-expo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

export default function Page() {
	if (__DEV__) {
		// Adds messages only in a dev environment
		loadDevMessages();
		loadErrorMessages();
	}
	const { setActiveSheet } = useSheetContext();

	const { isChangingLocation } = useLocation();

	console.log("IsChangingLocation", isChangingLocation);
	return (
		<SignedIn>
			<MetaDataProvider>
				<RouteProvider>
					<DispatchProvider>
						<View className="flex-1">
							<Map />
							<Navigation />
						</View>

						{!isChangingLocation && (
							<View style={{ position: "absolute", bottom: 30, width: "100%" }}>
								<View className="flex-row justify-center items-center">
									<RouteSession />
								</View>
							</View>
						)}
						{/* <Map />
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
									<Pressable
										className="bg-white rounded-full p-4 shadow shadow-black/20"
										onPress={() => setActiveSheet("route")}
									>
										<MaterialIcons name="route" size={24} color={colors.primary} />
									</Pressable>
								</View>
							</SafeAreaView>
						</View>
						<View style={{ position: "absolute", bottom: 30, width: "100%" }}>
							<View className="flex-row justify-center items-center">
								<RouteSession />
							</View>
						</View> */}

						<RouteSheet />
						<SelectedDispatchSheet />
						<SettingsSheet />
						<AccountSheet />
						<Toast />
					</DispatchProvider>
				</RouteProvider>
			</MetaDataProvider>
		</SignedIn>
	);
}
