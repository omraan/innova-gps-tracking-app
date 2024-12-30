import colors from "@/colors";
import Map from "@/components/mapbox/Map";
import RouteSheet from "@/components/RouteSheet";
import SelectedOrderSheet from "@/components/SelectedOrderSheet";
import SettingsSheet from "@/components/SettingsSheet";
import { useDateStore } from "@/hooks/useDateStore";
import { MetaDataProvider } from "@/providers/MetaDataProvider";
import OrderProvider from "@/providers/OrderProvider";
import { RouteProvider } from "@/providers/RouteProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { SignedIn } from "@clerk/clerk-expo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function Page() {
	const { setActiveSheet } = useSheetContext();
	const { selectedDate } = useDateStore();
	return (
		<SignedIn>
			<MetaDataProvider>
				<OrderProvider>
					<RouteProvider>
						<View style={{ flex: 1 }}>
							<Map />
							<SafeAreaView style={styles.safeArea}>
								<View style={styles.buttonContainer}>
									<TouchableOpacity>
										{/* <Text className="text-red-700 text-lg">Action 2</Text> */}
									</TouchableOpacity>
									<View
										style={{
											display: "flex",
											flexDirection: "column",
											gap: 20,
											justifyContent: "space-between",
										}}
									>
										<TouchableOpacity
											style={styles.pillButton}
											onPress={() => setActiveSheet("settings")}
										>
											<MaterialIcons name="settings" size={30} color={colors.secondary} />
										</TouchableOpacity>
										<TouchableOpacity
											style={styles.pillButton}
											onPress={() => setActiveSheet("route")}
										>
											<MaterialIcons name="route" size={30} color={colors.secondary} />
										</TouchableOpacity>
									</View>
								</View>
							</SafeAreaView>
						</View>
						<RouteSheet />
						<SelectedOrderSheet />
						<SettingsSheet />
					</RouteProvider>
				</OrderProvider>
			</MetaDataProvider>
		</SignedIn>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		marginTop: 10,
	},
	pillButton: {
		backgroundColor: "white",
		padding: 15,
		borderRadius: 50,
	},
});
