import { UPDATE_ROUTE_END_TIME } from "@/graphql/mutations";
import { useDateStore } from "@/hooks/useDateStore";
import { useRouteSessionStore } from "@/hooks/useRouteSessionStore";
import { useDispatch } from "@/providers/DispatchProvider";
import { useRoute } from "@/providers/RouteProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { useMutation } from "@apollo/client";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import moment from "moment";
import { Text, TouchableOpacity, View } from "react-native";
import DispatchList from "./DispatchList";
import { ModalPicker } from "./ModalPicker";

export default function RouteSheet() {
	const { dispatches }: any = useDispatch();
	const { bottomSheetRefs, handlePanDownToClose } = useSheetContext();
	const { routeSession, setRouteSession } = useRouteSessionStore();

	const [UpdateRouteEndTime] = useMutation(UPDATE_ROUTE_END_TIME);
	const { routes, selectionRoutes, selectedRoute, setSelectedRoute } = useRoute();

	const { selectedDate } = useDateStore();

	const endRoute = async () => {
		const endTime = moment(new Date()).format("yyyy-MM-DD HH:mm:ss");

		if (!selectedDate) {
			return;
		}
		if (!selectedRoute) {
			return;
		}

		const variables = {
			date: selectedDate,
			routeId: selectedRoute?.name,
			endTime,
		};
		await UpdateRouteEndTime({
			variables,
			onCompleted: (data) => {
				setSelectedRoute({
					name: selectedRoute.name,
					value: {
						...selectedRoute.value,
						endTime,
						active: false,
					},
				});
			},
		});
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
			{!selectedRoute && selectionRoutes && selectionRoutes.length > 0 ? (
				<View>
					{
						<View>
							<Text className="text-center text-gray-500">Select a route to start</Text>
							<ModalPicker
								list={selectionRoutes.map((route: any) => {
									return {
										value: route.name,
										label: route.value.title,
									};
								})}
								onSelect={(routeId) =>
									setSelectedRoute(selectionRoutes.find((r) => r.name === routeId))
								}
							/>
						</View>
					}
				</View>
			) : (
				<View />
			)}
			{selectedRoute?.value.active ? (
				<View className="flex-row items-center justify-center py-4">
					<TouchableOpacity onPress={endRoute} className="bg-black py-4 px-8 rounded">
						<Text className="text-white font-bold">End Route</Text>
					</TouchableOpacity>
				</View>
			) : (
				<View />
			)}

			{dispatches && dispatches.length > 0 && (
				<BottomSheetScrollView
					style={{
						flex: 1,
						padding: 10,
					}}
				>
					<DispatchList />
				</BottomSheetScrollView>
			)}
		</BottomSheet>
	);
}
