import { MapViewOptions } from "@/constants/MapViewOptions";
import { useOrder } from "@/providers/OrderProvider";
import { useRoute } from "@/providers/RouteProvider";
import { useOrganization, useUser } from "@clerk/clerk-expo";
import Mapbox, { Camera, LocationPuck, MapView } from "@rnmapbox/maps";
import { useEffect, useRef, useState } from "react";
import LineRoute from "./LineRoute";
import OrderMarkers from "./OrderMarkers";
const publicAccessToken =
	"pk.eyJ1IjoidmVkaXNwYXRjaCIsImEiOiJjbTU4NWU0ZzkzbXB1MmtzZGdlOGIwZjM2In0.3C22WiMd_1T_mRsYAWm8GQ";

Mapbox.setAccessToken(publicAccessToken);
export default function Map() {
	const { organization } = useOrganization();
	const [followingUser, setFollowingUser] = useState(false);

	const { orders } = useOrder();
	const { routeCoordinates } = useRoute();
	const cameraRef = useRef<Camera>(null);

	const defaultLatitude = organization?.publicMetadata.lat || 12.503286;
	const defaultLongitude = organization?.publicMetadata.lng || -69.980893;
	useEffect(() => {
		// Since default zoom level for followUserLocatin is 1, we wait for a bit before setting it to true
		setTimeout(() => {
			setFollowingUser(true);
		}, 500);
	}, []);
	const { user } = useUser();
	useEffect(() => {
		setFollowingUser(false);
	}, [user?.unsafeMetadata.defaultMapView]);

	const mapView = (user?.unsafeMetadata.defaultMapView as string) || "standard";
	console.log(mapView);
	return (
		<MapView
			key={mapView}
			style={{ flex: 1 }}
			styleURL={
				"mapbox://styles/vedispatch/cm5azom7t00kd01sb25kkc74o"
				// MapViewOptions.find((mapView) => mapView.value === (user?.unsafeMetadata.defaultMapView as string))
				// 	?.styleUrl
			}
			logoEnabled={false}
			attributionEnabled={false}
			compassEnabled={false}
			scaleBarEnabled={false}
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
			{orders && orders.length > 0 && <OrderMarkers orders={orders} />}
			{routeCoordinates && <LineRoute coordinates={routeCoordinates} />}
			<LocationPuck puckBearingEnabled puckBearing="heading" pulsing={{ isEnabled: true }} />
		</MapView>
	);
}
