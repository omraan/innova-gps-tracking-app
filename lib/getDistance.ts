import haversine from "haversine-distance";

export const getDistance = (
	location1: { latitude: number; longitude: number },
	location2: { latitude: number; longitude: number }
) => {
	return haversine(location1, location2);
};
