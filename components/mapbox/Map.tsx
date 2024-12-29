import { useOrder } from "@/providers/OrderProvider";
import { useRoute } from "@/providers/RouteProvider";
import polyline from "@mapbox/polyline";
import Mapbox, { Camera, LocationPuck, MapView, ShapeSource, SymbolLayer } from "@rnmapbox/maps";
import { point } from "@turf/helpers";
import LineRoute from "./LineRoute";
import OrderMarkers from "./OrderMarkers";

// import LineRoute from './LineRoute';
// import ScooterMarkers from './ScooterMarkers';

// import { useScooter } from '~/providers/ScooterProvider';
const access_token = "pk.eyJ1Ijoib21yYWFuIiwiYSI6ImNtMmkwZjNoNDBoZ2gya29nc245Njg0MXAifQ.3WcGRlCHfqTjtp-Nli-L0w";

Mapbox.setAccessToken(access_token);
export default function Map() {
	// const { directionCoordinates }: any = useScooter();
	//mapbox://styles/omraan/cm56mfh1300hn01r1dc3z6xj9/draft
	const { orders } = useOrder();
	const { routeCoordinates } = useRoute();

	return (
		<MapView
			style={{ flex: 1 }}
			styleURL="mapbox://styles/mapbox/streets-v12"
			logoEnabled={false}
			attributionEnabled={false}
			compassEnabled={false}
			scaleBarEnabled={false}
		>
			<Camera followZoomLevel={11} followUserLocation />
			{orders && orders.length > 0 && <OrderMarkers orders={orders} />}
			{routeCoordinates && <LineRoute coordinates={routeCoordinates} />}
			<LocationPuck puckBearingEnabled puckBearing="heading" pulsing={{ isEnabled: true }} />
		</MapView>
	);
}
