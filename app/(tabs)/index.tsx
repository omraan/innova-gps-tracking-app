import colors from "@/colors";
import AccountSheet from "@/components/AccountSheet";
import Map from "@/components/mapbox/Map";
import RouteSession from "@/components/RouteSession";
import RouteSheet from "@/components/RouteSheet";
import SearchBar from "@/components/SearchBar";
import SelectedOrderSheet from "@/components/SelectedOrderSheet";
import SettingsSheet from "@/components/SettingsSheet";
import { MetaDataProvider } from "@/providers/MetaDataProvider";
import OrderProvider from "@/providers/OrderProvider";
import { RouteProvider } from "@/providers/RouteProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { SignedIn } from "@clerk/clerk-expo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, SafeAreaView, View } from "react-native";

export default function Page() {
	const { setActiveSheet } = useSheetContext();

	return (
		<SignedIn>
			<MetaDataProvider>
				<OrderProvider>
					<RouteProvider>
						<View className="flex-1">
							<Map />
							<SafeAreaView className="absolute top-0 left-0 right-0">
								<View className="flex-row justify-between gap-5 px-6 items-start">
									<Pressable
										className="bg-white rounded-full p-4 m-auto shadow shadow-black/20"
										onPress={() => setActiveSheet("account")}
									>
										<MaterialIcons name="person" size={24} color={colors.secondary} />
									</Pressable>
									<SearchBar />

									<View className="flex-column gap-8 justify-between">
										<Pressable
											className="bg-white rounded-full p-4 shadow shadow-black/20"
											onPress={() => setActiveSheet("settings")}
										>
											<MaterialIcons name="settings" size={24} color={colors.secondary} />
										</Pressable>
									</View>
								</View>
								<View className="flex-row justify-end px-6 py-6">
									<Pressable
										className="bg-white rounded-full p-4 shadow shadow-black/20"
										onPress={() => setActiveSheet("route")}
									>
										<MaterialIcons name="route" size={24} color={colors.secondary} />
									</Pressable>
								</View>
							</SafeAreaView>
						</View>
						<View style={{ position: "absolute", bottom: 30, width: "100%" }}>
							<View className="flex-row justify-center items-center">
								<RouteSession />
							</View>
						</View>

						<RouteSheet />
						<SelectedOrderSheet />
						<SettingsSheet />
						<AccountSheet />
					</RouteProvider>
				</OrderProvider>
			</MetaDataProvider>
		</SignedIn>
	);
}
