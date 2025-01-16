import AccountSheet from "@/components/AccountSheet";
import Map from "@/components/mapbox/Map";
import Navigation from "@/components/Navigation";
import RouteSession from "@/components/RouteSession";
import RouteSheet from "@/components/RouteSheet";
import SelectedOrderSheet from "@/components/SelectedOrderSheet";
import SettingsSheet from "@/components/SettingsSheet";
import { useLocation } from "@/providers/LocationProvider";
import { MetaDataProvider } from "@/providers/MetaDataProvider";
import OrderProvider from "@/providers/OrderProvider";
import { RouteProvider } from "@/providers/RouteProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { SignedIn } from "@clerk/clerk-expo";
import { Pressable, SafeAreaView, View } from "react-native";
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
				<OrderProvider>
					<RouteProvider>
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
