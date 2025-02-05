import puckShadow from "@/assets/images/puck-shadow.png";
import puck from "@/assets/images/puck.png";
import { MapViewOptions } from "@/constants/MapViewOptions";
import { useNavigationStore } from "@/hooks/useNavigationStore";
import { getDistance } from "@/lib/getDistance";
import { useDispatch } from "@/providers/DispatchProvider";
import { useLocation } from "@/providers/LocationProvider";
import { useOrganization, useUser } from "@clerk/clerk-expo";
import Mapbox, {
	Camera,
	Images,
	LocationPuck,
	MapView,
	ShapeSource,
	SymbolLayer,
	UserTrackingMode,
} from "@rnmapbox/maps";
import { featureCollection, point } from "@turf/helpers";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import DispatchMarkers from "./DispatchMarkers";
import LineRoute from "./LineRoute";
const publicAccessToken =
	"pk.eyJ1IjoidmVkaXNwYXRjaCIsImEiOiJjbTU4NWU0ZzkzbXB1MmtzZGdlOGIwZjM2In0.3C22WiMd_1T_mRsYAWm8GQ";

Mapbox.setAccessToken(publicAccessToken);
export default function Map() {
	const { organization } = useOrganization();
	const { liveLocation, isChangingLocation, setFollowUserLocation, markerCoordinate, setMarkerCoordinate } =
		useLocation();
	const { dispatches, filteredDispatches, routeCoordinates } = useDispatch();

	const cameraRef = useRef<Camera>(null);
	const mapViewRef = useRef<MapView>(null);
	const { activeNavigateOption } = useNavigationStore();

	const defaultLatitude = liveLocation?.latitude || (organization?.publicMetadata.lat as number) || 12.503286;
	const defaultLongitude = liveLocation?.longitude || (organization?.publicMetadata.lng as number) || -69.980893;
	useEffect(() => {
		// Since default zoom level for followUserLocatin is 1, we wait for a bit before setting it to true
		setTimeout(() => {
			setFollowUserLocation(true);
		}, 500);
	}, []);
	const { user } = useUser();

	const mapView = (user?.unsafeMetadata.defaultMapView as string) || "standard";
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const currentDispatch = filteredDispatches
		.filter((dispatch) => dispatch.value.status === "Open")
		.sort((a, b) => a.value.route.index! - b.value.route.index!)[0];

	useEffect(() => {
		if (currentDispatch && liveLocation) {
			const { steps } = currentDispatch.value.route;
			let closestStepIndex = 0;
			let minDistance = Infinity;
			if (steps && steps.length > 0) {
				steps.forEach((step: Step, index: number) => {
					const distance = getDistance(
						{ latitude: liveLocation.latitude, longitude: liveLocation.longitude },
						{ latitude: step.maneuver.location[1], longitude: step.maneuver.location[0] }
					);
					if (distance < minDistance) {
						minDistance = distance;
						closestStepIndex = index;
					}
				});
				setCurrentStepIndex(closestStepIndex);
			}
		}
	}, [filteredDispatches, liveLocation]);

	useEffect(() => {
		if (activeNavigateOption) {
			const handleNavigation = async () => {
				const { coords } = await Location.getCurrentPositionAsync();
				const { latitude: userLatitude, longitude: userLongitude } = coords;
				switch (activeNavigateOption) {
					case "navigate":
						// Set navigation mode to driving mode
						// // Implement driving mode logic here
						cameraRef.current?.setCamera({
							centerCoordinate: [userLongitude, userLatitude],
							zoomLevel: 19,
							animationDuration: 1000,
							animationMode: "flyTo",
							padding: {
								paddingTop: 500,
								paddingBottom: 0,
								paddingLeft: 0,
								paddingRight: 0,
							},
							pitch: 60,
						});

						break;
					case "locate-dispatch":
						// Locate the next location (currentDispatch) and center the camera position
						if (currentDispatch) {
							const { lat: dispatchLatitude, lng: dispatchLongitude } = currentDispatch.value.customer;
							cameraRef.current?.setCamera({
								centerCoordinate: [dispatchLongitude, dispatchLatitude],
								zoomLevel: 15,
								animationDuration: 1000,
								animationMode: "flyTo",
								pitch: 0,
							});

							// cameraRef.current?.flyTo([dispatchLongitude, dispatchLatitude], 500);
						}
						break;
					case "locate-user":
						// Locate the user location and center the camera position

						cameraRef.current?.setCamera({
							centerCoordinate: [userLongitude, userLatitude],
							zoomLevel: 15,
							animationDuration: 1000,
							animationMode: "flyTo",
							pitch: 0,
						});
						break;
					case "locate-route":
						// Locate both user and dispatch location and adjust the camera position accordingly
						if (currentDispatch && liveLocation) {
							cameraRef.current?.fitBounds(
								[liveLocation.longitude, liveLocation.latitude],
								[currentDispatch.value.customer.lng, currentDispatch.value.customer.lat],
								[50, 50, 50, 50]
							);
						}
						break;
					default:
						break;
				}
				// setActiveNavigateOption(null); // Reset the activeNavigateOption after handling
			};
			handleNavigation();
		}
	}, [activeNavigateOption]);

	const [userInteractionTimeout, setUserInteractionTimeout] = useState<NodeJS.Timeout | null>(null);

	const handleUserInteraction = () => {
		// Clear any existing timeout
		if (userInteractionTimeout) {
			clearTimeout(userInteractionTimeout);
		}

		// Set followUserLocation to false when the user interacts with the map
		setFollowUserLocation(false);

		// Set a timeout to re-enable followUserLocation after 5 seconds of inactivity
		const timeout = setTimeout(() => {
			setFollowUserLocation(true);
		}, 5000);

		setUserInteractionTimeout(timeout);
	};

	return (
		<MapView
			ref={mapViewRef}
			key={mapView}
			style={{ flex: 1 }}
			styleURL={
				MapViewOptions.find((mapView) => mapView.value === (user?.unsafeMetadata.defaultMapView as string))
					?.styleUrl
			}
			logoEnabled={false}
			attributionEnabled={false}
			compassEnabled={false}
			scaleBarEnabled={false}
			onCameraChanged={(e) => {
				handleUserInteraction;
				if (e.properties.center) {
					setMarkerCoordinate(e.properties.center);
				}
			}}
		>
			{activeNavigateOption && activeNavigateOption === "navigate" ? (
				<>
					<Camera
						followZoomLevel={19}
						centerCoordinate={[defaultLongitude, defaultLatitude + 0.05]} // Verplaats de camera iets naar boven
						followUserLocation={true}
						animationMode="flyTo"
						animationDuration={0}
						followUserMode={UserTrackingMode.FollowWithCourse} // Volg de richting waarin de gebruiker kijkt
						followPitch={60} // Stel de hoek in voor een helikopterview
						followPadding={{ paddingTop: 500 }}
					/>
					<LocationPuck puckBearingEnabled puckBearing="course" topImage="puck" shadowImage="puckShadow" />
				</>
			) : (
				<>
					<Camera
						ref={cameraRef}
						centerCoordinate={[defaultLongitude, defaultLatitude + 0.05]}
						followUserLocation={false}
						followPitch={0}
						pitch={0}
					/>
					<LocationPuck puckBearingEnabled puckBearing="heading" pulsing={{ isEnabled: true }} />
				</>
			)}
			{dispatches && dispatches.length > 0 && <DispatchMarkers />}
			{routeCoordinates && <LineRoute coordinates={routeCoordinates} />}

			<Images images={{ puck, puckShadow }} />

			{isChangingLocation && (
				<>
					<ShapeSource id="markerChangeLocationShape" shape={featureCollection([point(markerCoordinate)])}>
						<SymbolLayer
							id="symbolChangeLocationSymbol"
							style={{
								iconImage: "pinNew",
								iconSize: 0.35,
								iconAnchor: "bottom",
							}}
						/>
						<Images images={{ puck }} />
					</ShapeSource>
				</>
			)}
			{currentDispatch?.value.route.steps &&
				currentDispatch?.value.route.steps[currentStepIndex] &&
				currentDispatch?.value.route.steps[currentStepIndex].maneuver.instruction && (
					<View className="absolute top-16 left-0 right-0 pt-20 pr-[90px] pl-5">
						<View className="bg-black/50 p-5 rounded-xl h-auto">
							<Text className=" text-xl font-bold text-white">
								{currentDispatch?.value.route.steps[currentStepIndex].maneuver.instruction}
							</Text>
						</View>
					</View>
				)}
		</MapView>
	);
}
