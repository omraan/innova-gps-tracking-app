import { useAuth, useOrganization, useUser } from "@clerk/clerk-expo";
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { Animated, FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";
import IonIcon from "react-native-vector-icons/Ionicons";
import McIcon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTailwind } from "tailwind-rn";

export default function MapOrders({
	orders,
	sortedOrders,
	setOrdersIndex,
	currentLocation,
	liveLocation,
	handleSelection,
	handleRefresh,
	showDirections,
}: {
	orders: CustomerOrders[];
	sortedOrders: CustomerOrders[];
	setOrdersIndex: Dispatch<SetStateAction<number[]>>;
	currentLocation: [number, number];
	liveLocation: [number, number];

	handleSelection: (order: CustomerOrders) => void;
	handleRefresh: () => void;
	showDirections?: boolean;
}) {
	const tw = useTailwind();
	const { organization } = useOrganization();
	const { userId, orgId, orgRole: authRole } = useAuth();
	const { user } = useUser();

	const mapRef = useRef<MapView>(null);
	const [mapType, setMapType] = useState<MapTypes>("standard");

	const [locationMode, setLocationMode] = useState<"off" | "current_location" | "follow_location">("off");

	const scaleAnim = useRef(new Animated.Value(1)).current;
	const colorAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (user) {
			setMapType(user.unsafeMetadata.defaultMapView as MapTypes);
		}
	}, [user]);

	const statusCategories: StatusCategory[] = organization?.publicMetadata.statusCategories || [
		{
			color: "#000000",
			name: "Unknown",
		},
	];

	const goToLiveLocation = async () => {
		if (mapRef.current && liveLocation[0] !== 0 && liveLocation[1] !== 0) {
			const boundaries = await mapRef.current.getMapBoundaries();
			const latitudeDelta = Math.abs(boundaries.northEast.latitude - boundaries.southWest.latitude);
			const longitudeDelta = Math.abs(boundaries.northEast.longitude - boundaries.southWest.longitude);

			mapRef.current.animateToRegion(
				{
					latitude: liveLocation[0],
					longitude: liveLocation[1],
					latitudeDelta,
					longitudeDelta,
				},
				1000
			);
		}
	};

	useEffect(() => {
		if (locationMode === "follow_location") {
			goToLiveLocation();
		}
	}, [locationMode, liveLocation]);

	useEffect(() => {
		if (locationMode === "current_location") {
			goToLiveLocation();
		}
	}, [locationMode]);

	useEffect(() => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(scaleAnim, {
					toValue: 1.1,
					duration: 1000,
					useNativeDriver: true,
				}),
				Animated.timing(scaleAnim, {
					toValue: 1,
					duration: 1000,
					useNativeDriver: true,
				}),
			])
		).start();

		Animated.loop(
			Animated.sequence([
				Animated.timing(colorAnim, {
					toValue: 1.05,
					duration: 1000,
					useNativeDriver: false,
				}),
				Animated.timing(colorAnim, {
					toValue: 0,
					duration: 1000,
					useNativeDriver: false,
				}),
			])
		).start();
	}, [scaleAnim, colorAnim]);

	const interpolatedColor = colorAnim.interpolate({
		inputRange: [0, 1],
		outputRange: ["rgb(100, 160, 232)", "rgb(255,255,255)"], // Groen naar rood
	});

	// const routeOrders = sortedOrders?.slice(0, 24) || [];
	const routeExists = orders && orders[0] && orders[0].routeIndex !== undefined;

	const [orgRole, setOrgRole] = useState<string | undefined>();

	useEffect(() => {
		const metaDataLabels = user?.publicMetadata as UserPublicMetadata;
		if (authRole === "org:admin") {
			setOrgRole("org:admin");
		} else {
			if (
				orgId &&
				metaDataLabels &&
				metaDataLabels.organizations &&
				metaDataLabels.organizations[orgId]?.orgRole
			) {
				setOrgRole(metaDataLabels.organizations[orgId].orgRole);
			}
		}
	}, [user?.publicMetadata, orgId]);

	useEffect(() => {
		console.log(currentLocation);
	}, [currentLocation]);

	return (
		<View style={tw("h-full")}>
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
								sortedOrders
									.map((order: any) => ({
										latitude: order.customer?.lat || 0,
										longitude: order.customer?.lng || 0,
									}))
									.slice(0, 24) || []
							}
							destination={{
								latitude: sortedOrders[sortedOrders.length - 1].customer?.lat || 0,
								longitude: sortedOrders[sortedOrders.length - 1].customer?.lng || 0,
							}}
							// splitWaypoints={true}
							optimizeWaypoints={true}
							apikey="AIzaSyBnR0kXdNPHlgTMIpJRwlGfBgZNszzLB1I"
							strokeWidth={5}
							strokeColor="blue"
							// onReady={(result) => {
							// 	if (
							// 		!routeExists &&
							// 		result.waypointOrder &&
							// 		result.waypointOrder[0] &&
							// 		result.waypointOrder[0].length > 0
							// 	) {
							// 		result.waypointOrder[0].forEach((routeIndex: number) => {
							// 			const variables: any = {
							// 				id: sortedOrders[routeIndex].id,
							// 				routeIndex,
							// 			};

							// 			UpdateOrder({
							// 				variables,
							// 				refetchQueries: [GET_ORDERS_BY_DATE],
							// 				awaitRefetchQueries: true,
							// 				update: (cache) => {
							// 					// Handmatig de cache bijwerken als dat nodig is
							// 					const existingOrders: OrderExtended[] =
							// 						cache.readQuery({ query: GET_ORDERS_BY_DATE }) || [];
							// 					if (existingOrders) {
							// 						const newOrders = existingOrders.map((existingOrder) =>
							// 							existingOrder.id === sortedOrders[routeIndex].id
							// 								? {
							// 										...existingOrder,
							// 										routeIndex,
							// 								  }
							// 								: existingOrder
							// 						);
							// 						cache.writeQuery({
							// 							query: GET_ORDERS_BY_DATE,
							// 							data: { orders: newOrders },
							// 						});
							// 					}
							// 				},
							// 			});
							// 		});
							// 	}
							// 	setOrdersIndex(...result.waypointOrder);
							// }}
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
									latitude: order.customer?.lat,
									longitude: order.customer?.lng,
								}}
								identifier="destination"
								onPress={() => {
									handleSelection(order);
								}}
								style={[tw("z-10"), styles.iconContainer]}
								tracksViewChanges={false}
							>
								<FontAwesomeIcon
									key={index}
									name="map-marker"
									size={35}
									color={pinColor}
									style={[styles.iconContainer]}
								/>
							</Marker>
						);
					})}
				</MapView>
			)}

			<View style={tw("flex flex-row flex-wrap justify-end items-end pt-1")}>
				<Pressable style={tw("mx-3 bg-gray-500 px-5 py-2  my-3 rounded")} onPress={handleRefresh}>
					<IonIcon name="refresh" size={20} color="white" />
				</Pressable>
				<Pressable
					style={tw("mx-3 bg-gray-500 px-5 py-2  my-3 rounded")}
					onPress={() => {
						setMapType(mapType === "standard" ? "hybrid" : "standard");
					}}
				>
					<McIcon name="layers-outline" size={20} color="white" />
				</Pressable>
				<Pressable
					style={tw("mx-3 bg-gray-500 px-5 py-2 my-3 rounded")}
					onPress={() => {
						setLocationMode(
							locationMode === "off"
								? "current_location"
								: locationMode === "current_location"
								? "follow_location"
								: "off"
						);
					}}
				>
					<Animated.View style={locationMode === "follow_location" && { transform: [{ scale: scaleAnim }] }}>
						<Animated.Text style={locationMode === "follow_location" && { color: interpolatedColor }}>
							<FontAwesome6Icon
								name={locationMode === "follow_location" ? "location-arrow" : "location-crosshairs"}
								size={20}
								{...(locationMode !== "follow_location" && tw("text-white"))}
							/>
						</Animated.Text>
					</Animated.View>
				</Pressable>
			</View>
		</View>
	);
}
const styles = StyleSheet.create({
	iconContainer: {
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.8,
				shadowRadius: 2,
			},
			android: {
				elevation: 5,
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.8,
				shadowRadius: 2,
			},
		}),
	},
	shadow: {
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.8,
				shadowRadius: 2,
			},
			android: {
				elevation: 5,
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.8,
				shadowRadius: 2,
			},
		}),
	},
});
