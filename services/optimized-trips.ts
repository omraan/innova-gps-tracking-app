import { LatLng } from "react-native-maps";

// const BASE_URL = "https://api.mapbox.com/optimized-trips/v2";
const BASE_URL = "https://api.mapbox.com/optimized-trips/v1/mapbox/driving";
export async function getOptimizedTrip(start: LatLng, destinations: LatLng[]) {
	const coordinates = [start, ...destinations].map((d) => `${d.longitude},${d.latitude}`).join(";");
	const url = `${BASE_URL}/${coordinates}?source=first&destination=last&roundtrip=false&access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`;
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	const routeResponse: any = await response.json();

	// if (!routeResponse.routes || routeResponse.routes.length === 0) {
	// 	throw new Error("No routes found");
	// }
	return routeResponse;
}
