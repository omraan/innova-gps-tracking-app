export const getBearing = (
	start: { latitude: number; longitude: number },
	end: { latitude: number; longitude: number }
): number => {
	const startLat = degreesToRadians(start.latitude);
	const startLng = degreesToRadians(start.longitude);
	const endLat = degreesToRadians(end.latitude);
	const endLng = degreesToRadians(end.longitude);

	const dLng = endLng - startLng;
	const y = Math.sin(dLng) * Math.cos(endLat);
	const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);
	const bearing = radiansToDegrees(Math.atan2(y, x));
	return (bearing + 360) % 360;
};

function degreesToRadians(degrees: number): number {
	return (degrees * Math.PI) / 180;
}

function radiansToDegrees(radians: number): number {
	return (radians * 180) / Math.PI;
}
