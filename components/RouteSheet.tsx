import { UPDATE_ROUTE_SESSION } from "@/graphql/mutations";
import { useDateStore } from "@/hooks/useDateStore";
import { useRouteSessionStore } from "@/hooks/useRouteSessionStore";
import { useOrder } from "@/providers/OrderProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { useMutation } from "@apollo/client";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import moment from "moment";
import { Text, TouchableOpacity, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import OrderList from "./OrderList";
export default function RouteSheet() {
	const { orders }: any = useOrder();
	const { bottomSheetRefs, handlePanDownToClose } = useSheetContext();
	const { routeSession, setRouteSession } = useRouteSessionStore();

	const [UpdateRouteSession] = useMutation(UPDATE_ROUTE_SESSION);
	const { selectedDate } = useDateStore();
	const endRoute = async () => {
		const variables = {
			id: routeSession?.id!,
			date: selectedDate,
			endTime: moment(new Date()).format("yyyy-MM-DD HH:mm:ss"),
		};
		await UpdateRouteSession({
			variables,
		});
		setRouteSession(null);
	};
	return (
		<BottomSheet
			ref={bottomSheetRefs.route}
			index={-1}
			snapPoints={["70%"]}
			enablePanDownToClose
			enableDynamicSizing={false}
			backgroundStyle={{ backgroundColor: "#f9f9f9" }}
			onClose={() => handlePanDownToClose("route")}
		>
			{routeSession ? (
				<View className="flex-row items-center justify-center py-4">
					<TouchableOpacity onPress={endRoute} className="bg-black py-4 px-8 rounded">
						<Text className="text-white font-bold">End Route</Text>
					</TouchableOpacity>
				</View>
			) : (
				<View />
			)}

			{orders && orders.length > 0 && (
				<BottomSheetScrollView
					style={{
						flex: 1,
						padding: 10,
					}}
				>
					<OrderList />
				</BottomSheetScrollView>
			)}
		</BottomSheet>
	);
}
