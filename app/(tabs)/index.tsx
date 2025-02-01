import AccountSheet from "@/components/AccountSheet";
import CurrentDispatchSheet from "@/components/CurrentDispatchSheet";
import Map from "@/components/mapbox/Map";
import Navigation from "@/components/Navigation";
import RouteSession from "@/components/RouteSession";
import RouteSheet from "@/components/RouteSheet";
import SelectedDispatchSheet from "@/components/SelectedDispatchSheet";
import SettingsSheet from "@/components/SettingsSheet";
import DispatchProvider from "@/providers/DispatchProvider";
import LocationProvider, { useLocation } from "@/providers/LocationProvider";
import { MetaDataProvider } from "@/providers/MetaDataProvider";
import { RouteProvider } from "@/providers/RouteProvider";
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { SignedIn } from "@clerk/clerk-expo";
import { View } from "react-native";
import Toast from "react-native-toast-message";

export default function Page() {
	if (__DEV__) {
		// Adds messages only in a dev environment
		loadDevMessages();
		loadErrorMessages();
	}
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
							<CurrentDispatchSheet />
							<Toast />
						</LocationProvider>
					</DispatchProvider>
				</RouteProvider>
			</MetaDataProvider>
		</SignedIn>
	);
}
