import pinNew from "@/assets/images/pin-new.png";
import { useLocation } from "@/providers/LocationProvider";
import { useRoute } from "@/providers/RouteProvider";
import { useOrganization, useUser } from "@clerk/clerk-expo";
import Mapbox, { Camera, Images, LocationPuck, MapView, ShapeSource, SymbolLayer } from "@rnmapbox/maps";
import { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DispatchMarkers from "./DispatchMarkers";
import LineRoute from "./LineRoute";

import { MapViewOptions } from "@/constants/MapViewOptions";
import { UPDATE_CUSTOMER, UPDATE_ORDER } from "@/graphql/mutations";
import { GET_DISPATCHES } from "@/graphql/queries";
import { useDateStore } from "@/hooks/useDateStore";
import { useDispatch } from "@/providers/DispatchProvider";
import { useMutation } from "@apollo/client";
import { featureCollection, point } from "@turf/helpers";
import React from "react";

const publicAccessToken =
	"pk.eyJ1IjoidmVkaXNwYXRjaCIsImEiOiJjbTU4NWU0ZzkzbXB1MmtzZGdlOGIwZjM2In0.3C22WiMd_1T_mRsYAWm8GQ";

Mapbox.setAccessToken(publicAccessToken);
export default function Map() {
	const { organization } = useOrganization();
	const [followingUser, setFollowingUser] = useState(false);
	const { isChangingLocation, setIsChangingLocation } = useLocation();
	const { dispatches, selectedDispatch, setSelectedDispatch, routeCoordinates } = useDispatch();

	const cameraRef = useRef<Camera>(null);
	const mapViewRef = useRef<MapView>(null);

	const { selectedDate } = useDateStore();

	const defaultLatitude = organization?.publicMetadata.lat || 12.503286;
	const defaultLongitude = organization?.publicMetadata.lng || -69.980893;
	useEffect(() => {
		// Since default zoom level for followUserLocatin is 1, we wait for a bit before setting it to true
		setTimeout(() => {
			setFollowingUser(true);
		}, 500);
	}, []);
	const { user } = useUser();
	const [markerCoordinate, setMarkerCoordinate] = useState<Position>([0, 0]);

	useEffect(() => {
		setFollowingUser(false);
	}, [user?.unsafeMetadata.defaultMapView]);

	const mapView = (user?.unsafeMetadata.defaultMapView as string) || "standard";

	const handleDiscardLocation = () => {
		setSelectedDispatch(undefined);
		setIsChangingLocation(false);
	};
	// const [UpdateOrder] = useMutation(UPDATE_ORDER);
	const [UpdateCustomer] = useMutation(UPDATE_CUSTOMER);

	const handleSaveLocation = async () => {
		if (!selectedDispatch) {
			console.log("No order selected");
			return;
		}

		try {
			await UpdateCustomer({
				variables: {
					id: selectedDispatch?.value.customerId,
					lat: markerCoordinate[1],
					lng: markerCoordinate[0],
					lastCoordinateUpdate: Number(new Date()),
				},
				// onCompleted: () => setLoading(false),
				update: (cache) => {
					// Handmatig de cache bijwerken als dat nodig is
					const existingOrders = cache.readQuery<{
						getOrdersByDate: { name: string; value: OrderExtended }[];
					}>({
						query: GET_DISPATCHES,
						variables: {
							date: selectedDate,
						},
					})?.getOrdersByDate;

					if (existingOrders) {
						const newOrders = existingOrders.map((existingOrder) =>
							existingOrder.value.customerId === selectedDispatch?.value.customerId
								? {
										name: existingOrder.name,
										value: {
											...existingOrder.value,
											customer: {
												...existingOrder.value.customer,
												lat: markerCoordinate[1],
												lng: markerCoordinate[0],
											},
											events: [
												...existingOrder.value.events!,
												{
													name: "",
													createdAt: Number(new Date()),
													createdBy: "",
													notes: existingOrder.value.notes || "",
													status: existingOrder.value.status,
													lat: markerCoordinate[1],
													lng: markerCoordinate[0],
													modifiedAt: Number(new Date()),
												},
											],
										},
								  }
								: existingOrder
						);
						cache.writeQuery({
							query: GET_DISPATCHES,
							variables: {
								date: selectedDate,
							},
							data: { getOrdersByDate: newOrders },
						});
					}
				},
			});
			setSelectedDispatch(undefined);
			setIsChangingLocation(false);
		} catch (error: any) {
			console.error(error);
		}
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
				if (e.properties.center) {
					setMarkerCoordinate(e.properties.center);
				}
			}}
		>
			<Camera
				ref={cameraRef}
				zoomLevel={11}
				followZoomLevel={11}
				centerCoordinate={[defaultLongitude, defaultLatitude]}
				followUserLocation={followingUser}
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
					<View className="absolute bottom-10 left-0 right-0 flex-row justify-center gap-5 px-10">
						<TouchableOpacity
							onPress={handleSaveLocation}
							className="bg-green-600 flex-1 py-4 rounded"
							// style={styles.saveButton}
						>
							<Text className="text-white text-center font-bold">Save</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={handleDiscardLocation} className="bg-red-600 flex-1 py-4 rounded">
							<Text className="text-white text-center font-bold">Discard</Text>
						</TouchableOpacity>
					</View>
				</>
			)}
		</MapView>
	);
}
