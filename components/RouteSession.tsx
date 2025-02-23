import colors from "@/colors";
import { UPDATE_LOCATION, UPDATE_ROUTE_START_TIME } from "@/graphql/mutations";
import { useSelectionStore } from "@/hooks/useSelectionStore";
import { useLocation } from "@/providers/LocationProvider";
import { useRoute } from "@/providers/RouteProvider";
import { useMutation } from "@apollo/client";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import moment from "moment";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { useTailwind } from "tailwind-rn";

export default function RouteSession() {
	const tw = useTailwind();

	const { selectedRoute, setSelectedRoute, selectedDate, selectedRouteStop, setSelectedRouteStop } =
		useSelectionStore();
	const { fetchRoutePolyline } = useRoute();
	const { isChangingLocation, setIsChangingLocation, markerCoordinate } = useLocation();

	const [UpdateRouteStartTime] = useMutation(UPDATE_ROUTE_START_TIME);

	const startRoute = async () => {
		const startTime = moment(new Date()).format("yyyy-MM-DD HH:mm:ss");
		if (!selectedDate) {
			return;
		}
		if (!selectedRoute) {
			return;
		}
		const variables = {
			date: selectedDate,
			id: selectedRoute?.name,
			startTime,
		};
		await UpdateRouteStartTime({
			variables,
			onCompleted: (data) => {
				setSelectedRoute({
					name: selectedRoute.name,
					value: {
						...selectedRoute.value,
						actual: {
							...selectedRoute.value.actual,
							timeStart: startTime,
							active: true,
						},
					},
				});
			},
			onError: (data) => {
				console.log("onError", data);
			},
		});
	};
	const handleDiscardLocation = () => {
		setSelectedRouteStop(null);
		setIsChangingLocation(false);
	};
	const [UpdateLocation] = useMutation(UPDATE_LOCATION);

	const handleSaveLocation = async () => {
		if (!selectedRouteStop) {
			console.log("No order selected");
			return;
		}
		if (!selectedRoute) {
			console.log("No route selected");
			return;
		}

		try {
			await UpdateLocation({
				variables: {
					id: selectedRouteStop?.value.locationId,
					lat: markerCoordinate[1],
					lng: markerCoordinate[0],
					lastCoordinateUpdate: Number(new Date()),
				},
				// onCompleted: () => setLoading(false),
				update: () => {
					fetchRoutePolyline({
						name: selectedRoute.name,
						value: {
							...selectedRoute.value,
							stops: selectedRoute.value.stops.map((routeStop) => {
								if (routeStop.name === selectedRouteStop.name) {
									return {
										...routeStop,
										location: {
											...routeStop.value.location,
											lat: markerCoordinate[1],
											lng: markerCoordinate[0],
										},
									};
								}
								return routeStop;
							}),
						},
					});
				},
			});
			setSelectedRouteStop(null);
			setIsChangingLocation(false);
		} catch (error: any) {
			console.error(error);
		}
	};
	return (
		<View>
			{!selectedRoute ? (
				<View className="flex-col items-center justify-center mb-2">
					<View className="bg-white px-4 py-2 rounded flex-row gap-2 items-center">
						<Text>Navigate to </Text>
						<View className="rounded-full border border-primary p-2">
							<MaterialIcons name="settings" size={16} color={colors.primary} />
						</View>
						<Text>to select a route</Text>
					</View>
					<AntDesign name="caretdown" size={12} color="white" style={{ marginTop: -4 }} />
				</View>
			) : (
				<View />
			)}
			{!selectedRoute ? (
				<View style={tw("flex flex-row items-center justify-center")}>
					<Pressable
						onPress={startRoute}
						className="bg-white py-3 px-5 rounded flex-row gap-3 items-center justify-between"
						style={{
							width: 150,
							marginHorizontal: "auto",
							opacity: !selectedDate || !selectedRoute ? 0.5 : 1,
						}}
					>
						<Text className="text-center text-secondary text-lg font-semibold">Start Route</Text>
						<AntDesign name="caretright" size={14} color="#6366f1" />
					</Pressable>
				</View>
			) : (
				<View />
			)}

			{isChangingLocation ? (
				<View className="flex flex-row justify-center gap-5 px-10 w-full">
					<TouchableOpacity onPress={handleSaveLocation} className="bg-green-600 w-full flex-1 py-4 rounded">
						<Text className="text-white text-center font-bold">Save</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={handleDiscardLocation} className="bg-red-600 flex-1 py-4 rounded">
						<Text className="text-white text-center font-bold">Discard</Text>
					</TouchableOpacity>
				</View>
			) : (
				<View />
			)}
		</View>
	);
}
