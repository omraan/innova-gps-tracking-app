import { useLiveLocationStore } from "@/hooks/useLocationStore";
import { useVehicleStore } from "@/hooks/useVehicleStore";
import { getCurrentLocation } from "@/lib/getCurrentLocation";
import { getDistance } from "@/lib/getDistance";
import { useAuth, useOrganization, useUser } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";
import IonIcon from "react-native-vector-icons/Ionicons";
import McIcon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTailwind } from "tailwind-rn";
import MapOrdersMarker from "./MapOrdersMarker";
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
	const { orgId, orgRole: authRole, userId } = useAuth();
	const [orgRole, setOrgRole] = useState<string | undefined>();
	const { user } = useUser();

	const { selectedVehicle } = useVehicleStore();

	const [originLocation, setOriginLocation] = useState<GeoLocation | null>(null);

	const mapRef = useRef<MapView>(null);
	const [mapType, setMapType] = useState<MapTypes>("standard");

	const [locationMode, setLocationMode] = useState<"off" | "current_location" | "follow_location">("off");

	const scaleAnim = useRef(new Animated.Value(1)).current;
	const colorAnim = useRef(new Animated.Value(0)).current;

	const [liveLocation, setLiveLocation] = useState<GeoLocation | null>(null);

	const watchUserPosition = () => {
		let locationSubscription: any;

		const startWatching = async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				console.error("Permission to access location was denied");
				return;
			}
			if (userId) {
				locationSubscription = await Location.watchPositionAsync(
					{
						accuracy: Location.Accuracy.High,
						timeInterval: 1000,
						distanceInterval: 10,
					},
					({ coords }) => {
						setLiveLocation({ latitude: coords.latitude, longitude: coords.longitude });
					}
				);
			}
		};

		startWatching();

		return () => {
			if (locationSubscription) {
				locationSubscription.remove();
			}
		};
	};

	const goToLiveLocation = async () => {
		if (
			mapRef.current &&
			liveLocation?.latitude &&
			liveLocation?.longitude &&
			liveLocation.latitude !== 0 &&
			liveLocation.longitude !== 0
		) {
			const boundaries = await mapRef.current.getMapBoundaries();
			const latitudeDelta = Math.abs(boundaries.northEast.latitude - boundaries.southWest.latitude);
			const longitudeDelta = Math.abs(boundaries.northEast.longitude - boundaries.southWest.longitude);

			mapRef.current.animateToRegion(
				{
					latitude: liveLocation.latitude,
					longitude: liveLocation.longitude,
					latitudeDelta,
					longitudeDelta,
				},
				1000
			);
		}
	};

	useEffect(() => {
		if (user) {
			setMapType(user.unsafeMetadata.defaultMapView as MapTypes);
		}
	}, [user]);

	useEffect(() => {
		if (locationMode === "current_location") {
			goToLiveLocation();
		}
		if (locationMode === "follow_location") {
			const cleanup = watchUserPosition();
			return cleanup;
		}
	}, [locationMode]);

	useEffect(() => {
		if (liveLocation && locationMode && locationMode === "follow_location") {
			goToLiveLocation();
		}
	}, [liveLocation, locationMode]);

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
		outputRange: ["rgb(100, 160, 232)", "rgb(255,255,255)"],
	});

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
		getCurrentLocation().then((location) => {
			setOriginLocation(location);
		});
	}, [orders]);

	const sortedOrders =
		orders && orders.length > 0 && originLocation
			? orders
					.filter((value: CustomerOrders) => value.status !== "Completed" && value.status !== "Failed")
					.filter((value: CustomerOrders) => value.customer?.lat !== 0)
					.map((value: CustomerOrders) => {
						const orderCoords = {
							latitude: value.customer.lat,
							longitude: value.customer.lng,
						};
						const distance = getDistance(originLocation, orderCoords);
						return { ...value, distance };
					})
					.sort((a: any, b: any) => a.distance - b.distance)
					.slice(0, 14)
			: [];

	return (
		<View style={tw("h-full")}>
			{originLocation?.latitude !== 0 && (
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
					{sortedOrders && sortedOrders.length > 0 && originLocation?.latitude && selectedVehicle && (
						<MapViewDirections
							origin={{
								latitude: originLocation.latitude,
								longitude: originLocation.longitude,
							}}
							waypoints={
								sortedOrders.map((order: any) => ({
									latitude: order.customer.lat,
									longitude: order.customer.lng,
								})) || []
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
						/>
					)}

					{orders.map((order: CustomerOrders, index: number) => (
						<MapOrdersMarker key={order.customerId} handleSelection={handleSelection} order={order} />
					))}
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
