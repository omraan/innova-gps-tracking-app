import * as Location from "expo-location";

export const getCurrentLocation = async () => {
	try {
		let currentLocation = await Location.getCurrentPositionAsync({});
		const { latitude, longitude } = currentLocation.coords;
		return { latitude: Number(latitude.toFixed(6)), longitude: Number(longitude.toFixed(6)) };
	} catch (error) {
		console.error("Error getting current location:", error);
		return null;
	}
};
