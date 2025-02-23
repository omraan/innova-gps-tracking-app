import pinNew from "@/assets/images/pin-new.png";
import puckShadow from "@/assets/images/puck-shadow.png";
import puck from "@/assets/images/puck.png";
import { MapViewOptions } from "@/constants/MapViewOptions";
import { useNavigationStore } from "@/hooks/useNavigationStore";
import { useSelectionStore } from "@/hooks/useSelectionStore";
import { getBearing } from "@/lib/getBearing";
import { getDistance } from "@/lib/getDistance";
import { useLocation } from "@/providers/LocationProvider";
import { useRoute } from "@/providers/RouteProvider";
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
import { Text, View } from "react-native";
import InstructionBox from "./InstructionBox";
import LineRoute from "./LineRoute";
import RouteStopMarkers from "./RouteStopMarkers";
const publicAccessToken =
	"pk.eyJ1IjoidmVkaXNwYXRjaCIsImEiOiJjbTU4NWU0ZzkzbXB1MmtzZGdlOGIwZjM2In0.3C22WiMd_1T_mRsYAWm8GQ";

Mapbox.setAccessToken(publicAccessToken);
export default function Map() {
	const { organization } = useOrganization();
	const { liveLocation, isChangingLocation, setFollowUserLocation, markerCoordinate, setMarkerCoordinate } =
		useLocation();
	const { currentRouteStop, setCurrentRouteStop, currentStepIndex, setCurrentStepIndex } = useRoute();
	const { selectedRoute } = useSelectionStore();

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

	const [prevLocation, setPrevLocation] = useState<LiveLocation | null>(null);
	const [towardsCurrentDispatch, setTowardsCurrentDispatch] = useState<boolean | undefined>(undefined);
	const [currentIndex, setCurrentIndex] = useState<number>(0);

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
						if (currentRouteStop) {
							cameraRef.current?.setCamera({
								centerCoordinate: [
									currentRouteStop.value.location.longitude,
									currentRouteStop.value.location.latitude,
								],
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
						if (currentRouteStop && liveLocation) {
							cameraRef.current?.setCamera({
								pitch: 0,
							});

							setTimeout(() => {
								cameraRef.current?.fitBounds(
									[liveLocation.longitude, liveLocation.latitude],
									[
										currentRouteStop.value.location.longitude,
										currentRouteStop.value.location.latitude,
									],
									[50, 50, 50, 50]
								);
							}, 100);
						}
						break;
					default:
						break;
				}
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

	useEffect(() => {
		setCurrentRouteStop(
			selectedRoute?.value.stops
				.filter((routeStop) => routeStop.value.status === "Open")
				.sort((a, b) => a.value.sequence! - b.value.sequence!)[0] || null
		);
	}, [selectedRoute]);

	useEffect(() => {
		if (currentRouteStop && liveLocation && prevLocation !== liveLocation) {
			const estimation = currentRouteStop.value.estimation;
			const steps = estimation?.steps;
			let closestStepIndex = 0;
			let minDistance = Infinity;

			if (prevLocation) {
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
					const currentDistance = getDistance(
						{ latitude: liveLocation.latitude, longitude: liveLocation.longitude },
						{
							latitude: steps[closestStepIndex].maneuver.location[1],
							longitude: steps[closestStepIndex].maneuver.location[0],
						}
					);
					const prevDistance = getDistance(
						{ latitude: prevLocation.latitude, longitude: prevLocation.longitude },
						{
							latitude: steps[closestStepIndex].maneuver.location[1],
							longitude: steps[closestStepIndex].maneuver.location[0],
						}
					);
					const nextStepIndex = closestStepIndex + 1;
					if (
						currentDistance > prevDistance && // Driving away from current dispatch
						nextStepIndex < steps.length && // There is a next step
						liveLocation.heading !== null // We can measure the heading of driver
					) {
						const nextStep = steps[nextStepIndex];
						const bearingToNextStep = getBearing(
							{ latitude: liveLocation.latitude, longitude: liveLocation.longitude },
							{ latitude: nextStep.maneuver.location[1], longitude: nextStep.maneuver.location[0] }
						);

						const headingDifference = Math.abs(liveLocation.heading - bearingToNextStep);
						if (headingDifference < 45 || headingDifference > 315) {
							// User driving/facing towards next step
							setCurrentStepIndex(nextStepIndex);
						} else {
							setCurrentStepIndex(closestStepIndex);
						}
					} else {
						setCurrentStepIndex(closestStepIndex);
					}
				}
			}
			setPrevLocation(liveLocation);
		}
	}, [prevLocation, currentRouteStop]);

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
			{selectedRoute?.value.stops && selectedRoute.value.stops.length > 0 && <RouteStopMarkers />}
			{selectedRoute?.value.coordinates && <LineRoute coordinates={selectedRoute.value.coordinates} />}

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
						<Images images={{ puck, pinNew }} />
					</ShapeSource>
				</>
			)}
			{currentRouteStop?.value.estimation?.steps &&
				currentRouteStop?.value.estimation.steps[currentStepIndex] &&
				currentRouteStop?.value.estimation.steps[currentStepIndex].maneuver.instruction && (
					<InstructionBox
						steps={currentRouteStop?.value.estimation.steps}
						currentStep={currentRouteStop?.value.estimation.steps[currentStepIndex]}
					/>
					// <View className="absolute top-16 left-0 right-0 pt-20 pr-[90px] pl-5">
					// 	<View className="bg-black/50 p-5 rounded-xl h-auto">
					// 		<Text className=" text-xl font-bold text-white">

					// 			{currentDispatch?.value.route.steps[currentStepIndex].maneuver.instruction}
					// 		</Text>
					// 	</View>
					// </View>
				)}
		</MapView>
	);
}
