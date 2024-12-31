interface MapViewOption {
	value: string;
	label: string;
	styleUrl: string;
}

export const MapViewOptions: MapViewOption[] = [
	{
		value: "standard",
		label: "Standard",
		styleUrl: "mapbox://styles/mapbox/streets-v11",
	},
	{
		value: "hybrid",
		label: "Satellite",
		styleUrl: "mapbox://styles/mapbox/satellite-streets-v12",
	},
];
