import pinNew from "@/assets/images/pin-new.png";
import { useLocation } from "@/providers/LocationProvider";
import { useOrganization, useUser } from "@clerk/clerk-expo";
import Mapbox, { Camera, Images, LocationPuck, MapView, ShapeSource, SymbolLayer } from "@rnmapbox/maps";
import { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position";
import { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import DispatchMarkers from "./DispatchMarkers";
import LineRoute from "./LineRoute";

import { MapViewOptions } from "@/constants/MapViewOptions";
import { UPDATE_CUSTOMER } from "@/graphql/mutations";
import { GET_DISPATCHES } from "@/graphql/queries";
import { useDateStore } from "@/hooks/useDateStore";
import { useDispatch } from "@/providers/DispatchProvider";
import { useMutation } from "@apollo/client";
import { featureCollection, point } from "@turf/helpers";
import * as Location from "expo-location";
import React from "react";
const publicAccessToken =
	"pk.eyJ1IjoidmVkaXNwYXRjaCIsImEiOiJjbTU4NWU0ZzkzbXB1MmtzZGdlOGIwZjM2In0.3C22WiMd_1T_mRsYAWm8GQ";

Mapbox.setAccessToken(publicAccessToken);
export default function Map() {
	const { organization } = useOrganization();
	// const [followingUser, setFollowUserLocation] = useState(false);
	const {
		liveLocation,
		isChangingLocation,
		setIsChangingLocation,
		followUserLocation,
		setFollowUserLocation,
		markerCoordinate,
		setMarkerCoordinate,
	} = useLocation();
	const { dispatches, setDispatches, selectedDispatch, setSelectedDispatch, routeCoordinates } = useDispatch();

	const cameraRef = useRef<Camera>(null);
	const mapViewRef = useRef<MapView>(null);

	const { selectedDate } = useDateStore();

	const defaultLatitude = liveLocation?.latitude || organization?.publicMetadata.lat || 12.503286;
	const defaultLongitude = liveLocation?.longitude || organization?.publicMetadata.lng || -69.980893;
	useEffect(() => {
		// Since default zoom level for followUserLocatin is 1, we wait for a bit before setting it to true
		setTimeout(() => {
			setFollowUserLocation(true);
		}, 500);
	}, []);
	const { user } = useUser();

	const mapView = (user?.unsafeMetadata.defaultMapView as string) || "standard";

	// const [UpdateOrder] = useMutation(UPDATE_ORDER);

	useEffect(() => {
		const setMapCenter = async () => {
			const { coords } = await Location.getCurrentPositionAsync();
			const { latitude, longitude } = coords;

			cameraRef.current?.setCamera({
				centerCoordinate: [longitude, latitude],
				animationDuration: 0,
				// zoomLevel: 11, // Stel het zoomniveau in zoals gewenst
				// duration: 0, // Geen animatie
			});
		};
		setMapCenter();
	}, [followUserLocation]);
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
			<Camera
				ref={cameraRef}
				// zoomLevel={11}
				// followZoomLevel={11}
				centerCoordinate={[defaultLongitude, defaultLatitude]}
				followUserLocation={followUserLocation}
				animationMode="flyTo"
				animationDuration={0}
			/>

			{dispatches && dispatches.length > 0 && <DispatchMarkers />}
			{routeCoordinates && <LineRoute coordinates={routeCoordinates} />}
			<LocationPuck puckBearingEnabled puckBearing="heading" pulsing={{ isEnabled: true }} />
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
						<Images images={{ pinNew }} />
					</ShapeSource>
				</>
			)}
		</MapView>
	);
}
