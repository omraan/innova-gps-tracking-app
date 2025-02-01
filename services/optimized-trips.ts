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

export async function getDirections(
	start: LatLng,
	destinations: LatLng[]
): Promise<{
	success: boolean;
	message: string;
	routes: any;
	waypoints: any;
}> {
	const coordinates = [start, ...destinations].map((d) => `${d.longitude},${d.latitude}`).join(";");

	const accessKey = process.env["EXPO_PUBLIC_MAPBOX_KEY"];
	const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?access_token=${accessKey}&alternatives=false&geometries=polyline&overview=full&steps=true`;
	const response: any = await fetch(url);
	const routeResponse: any = await response.json();

	if (routeResponse.message === "Not Found") {
		return {
			success: false,
			message: "We could not generate a route based on locations given.",
			waypoints: [],
			routes: [],
		};
	}
	if (routeResponse.code === "InvalidInput") {
		return { success: false, message: routeResponse.message, waypoints: [], routes: [] };
	}
	const { waypoints, routes } = routeResponse;

	return { success: true, message: "hello", waypoints, routes };
	// if (!response.ok) {
	// 	console.error(response);
	// 	throw new Error(`HTTP error! status: ${response.status}`);
	// }
	// const routeResponse: any = await response.json();
	// return routeResponse;
}
