const BASE_URL = "https://api.mapbox.com/directions/v5/mapbox";

export async function getDirections(from: [number, number], to: [number, number]) {
	const response = await fetch(
		`${BASE_URL}/driving/${from[0]},${from[1]};${to[0]},${to[1]}?alternatives=false&annotations=distance%2Cduration&continue_straight=true&geometries=geojson&overview=full&steps=false&access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`
	);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	const routeResponse: any = await response.json();

	if (!routeResponse.routes || routeResponse.routes.length === 0) {
		throw new Error("No routes found");
	}
	return routeResponse;
}
