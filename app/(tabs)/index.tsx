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
import LocationProvider, { useLocation } from "@/providers/LocationProvider";
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

	return (
		<SignedIn>
			<MetaDataProvider>
				<RouteProvider>
					<DispatchProvider>
						<LocationProvider>
							<View className="flex-1">
								<Map />
								<Navigation />
							</View>

							<View style={{ position: "absolute", bottom: 30, width: "100%" }}>
								<View className="flex-row justify-center items-center">
									<RouteSession />
								</View>
							</View>

							<RouteSheet />
							<SelectedDispatchSheet />
							<SettingsSheet />
							<AccountSheet />
							<Toast />
						</LocationProvider>
					</DispatchProvider>
				</RouteProvider>
			</MetaDataProvider>
		</SignedIn>
	);
}
