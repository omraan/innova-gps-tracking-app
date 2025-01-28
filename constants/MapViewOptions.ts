interface MapViewOption {
	value: string;
	label: string;
	styleUrl: string;
}

export const MapViewOptions: MapViewOption[] = [
	{
		value: "standard",
		label: "Standard",
		styleUrl: "mapbox://styles/vedispatch/cm5azom7t00kd01sb25kkc74o",
	},
	{
		value: "hybrid",
		label: "Satellite",
		styleUrl: "mapbox://styles/mapbox/satellite-streets-v12",
	},
];
