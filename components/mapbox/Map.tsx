import { useOrder } from "@/providers/OrderProvider";
import { useRoute } from "@/providers/RouteProvider";
import { useOrganization } from "@clerk/clerk-expo";
import Mapbox, { Camera, LocationPuck, MapView, ShapeSource, SymbolLayer } from "@rnmapbox/maps";
import { useEffect, useRef, useState } from "react";
import LineRoute from "./LineRoute";
import OrderMarkers from "./OrderMarkers";
const access_token = "pk.eyJ1Ijoib21yYWFuIiwiYSI6ImNtMmkwZjNoNDBoZ2gya29nc245Njg0MXAifQ.3WcGRlCHfqTjtp-Nli-L0w";

Mapbox.setAccessToken(access_token);
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
	return (
		<MapView
			style={{ flex: 1 }}
			styleURL="mapbox://styles/mapbox/satellite-streets-v12"
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
