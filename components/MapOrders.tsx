import { useAuth, useOrganization } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import haversine from "haversine-distance";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";
import { useTailwind } from "tailwind-rn";

export default function MapOrders({
	orders,
	handleSelection,
	handleRefresh,
}: {
	orders: CustomerOrders[];
	handleSelection: (order: CustomerOrders) => void;
	handleRefresh: () => void;
}) {
	const tw = useTailwind();
	const { organization } = useOrganization();
	const { userId } = useAuth();

	const mapRef = useRef<MapView>(null);
	const [mapType, setMapType] = useState<MapTypes>("hybrid");

	const [currentLocation, setCurrentLocation] = useState<[number, number]>([
		(organization?.publicMetadata.lat as number) || 0,
		(organization?.publicMetadata.lng as number) || 0,
	]);

	const statusCategories: StatusCategory[] = organization?.publicMetadata.statusCategories || [
		{
			color: "#000000",
			name: "Unknown",
		},
	];

	const getDistance = (
		location1: { latitude: number; longitude: number },
		location2: { latitude: number; longitude: number }
	) => {
		return haversine(location1, location2);
	};

	const getLocation = async () => {
		let { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== "granted") {
			console.error("Permission to access location was denied");
			return;
		}

		let location = await Location.getCurrentPositionAsync({});
		setCurrentLocation([location.coords.latitude, location.coords.longitude]);
	};
	useEffect(() => {
		getLocation();
	}, []);

	const sortedOrders = orders
		.filter((order: CustomerOrders) => order.status !== "Completed" && order.status !== "Failed")
		.map((order: CustomerOrders) => {
			const orderCoords = {
				latitude: order.customer?.lat || 0,
				longitude: order.customer?.lng || 0,
			};
			const distance = getDistance(
				{
					latitude: currentLocation[0],
					longitude: currentLocation[1],
				},
				orderCoords
			);
			return { ...order, distance };
		})
		.sort((a: any, b: any) => a.distance - b.distance)
		.slice(0, 24);

	return (
		<View style={[tw(`relative`), { height: 400, width: 400 }]}>
			{currentLocation[0] !== 0 && (
				<MapView
					key={organization?.slug}
					provider={PROVIDER_GOOGLE}
					style={StyleSheet.absoluteFillObject}
					mapType={mapType}
					initialRegion={{
						latitude: (organization?.publicMetadata.lat as number) || 0,
						longitude: (organization?.publicMetadata.lng as number) || 0,
						latitudeDelta: 0.2,
						longitudeDelta: 0.2,
					}}
					ref={mapRef}
					showsUserLocation={true}
				>
					{sortedOrders && sortedOrders.length > 0 && currentLocation[0] > 0 && (
						<MapViewDirections
							origin={{
								latitude: currentLocation[0],
								longitude: currentLocation[1],
							}}
							waypoints={
								sortedOrders.map((order: any) => {
									return {
										latitude: order.customer?.lat || 0,
										longitude: order.customer?.lng || 0,
									};
								}) || []
							}
							destination={{
								latitude: sortedOrders[sortedOrders.length - 1].customer?.lat || 0,
								longitude: sortedOrders[sortedOrders.length - 1].customer?.lng || 0,
							}}
							optimizeWaypoints={true}
							apikey="AIzaSyCsuRE5SM_yBawBZKVQxA9_9B6dTdFB2lQ"
							strokeWidth={5}
							strokeColor="blue"
						/>
					)}

					{orders.map((order: any, index: number) => {
						const pinColor =
							statusCategories.find(
								(status) =>
									order.status && status.name.toLocaleLowerCase() === order.status.toLocaleLowerCase()
							)?.color || "#000000";

						return (
							<Marker
								key={index}
								coordinate={{
									latitude: order.customer?.lat || 0,
									longitude: order.customer?.lng || 0,
								}}
								identifier="destination"
								onPress={() => {
									handleSelection(order);
								}}
							>
								<Icon
									key={`icon-${order.id}-${order.status}`}
									name="map-marker"
									size={35}
									color={pinColor}
									style={{
										shadowColor: "#000",
										shadowOffset: { width: 0, height: 2 },
										shadowOpacity: 0.25,
										shadowRadius: 5,
									}}
								/>
							</Marker>
						);
					})}
				</MapView>
			)}
			<View style={tw("flex flex-row justify-between")}>
				<Pressable style={tw("flex-1 mx-3 bg-gray-500 px-5 py-2  my-3 rounded")} onPress={handleRefresh}>
					<Text style={tw("text-white text-center")}>Refresh</Text>
				</Pressable>
				<Pressable
					style={tw("flex-1 mx-3 bg-gray-500 px-5 py-2  my-3 rounded")}
					onPress={() => {
						setMapType(mapType === "standard" ? "hybrid" : "standard");
					}}
				>
					<Text style={tw("text-white text-center")}>Change Map View</Text>
				</Pressable>
			</View>
		</View>
	);
}
