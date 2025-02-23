import pinGrayPriority from "@/assets/images/pin-gray-priority.png";
import pinGray from "@/assets/images/pin-gray.png";
import pinGreenPriority from "@/assets/images/pin-green-priority.png";
import pinGreen from "@/assets/images/pin-green.png";
import pinRedPriority from "@/assets/images/pin-red-priority.png";
import pinRed from "@/assets/images/pin-red.png";

import colors from "@/colors";
import { useSelectionStore } from "@/hooks/useSelectionStore";
import { useLocation } from "@/providers/LocationProvider";
import { useRoute } from "@/providers/RouteProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { CircleLayer, Images, ShapeSource, SymbolLayer } from "@rnmapbox/maps";
import { OnPressEvent } from "@rnmapbox/maps/lib/typescript/src/types/OnPressEvent";
import { featureCollection, point } from "@turf/helpers";
import { useEffect, useState } from "react";

export default function RouteStopMarkers() {
	const { filteredRouteStops } = useRoute();
	const { selectedRouteStop, setSelectedRouteStop } = useSelectionStore();
	const { isChangingLocation } = useLocation();

	const [bounceValue, setBounceValue] = useState([0, 0]);

	const points = filteredRouteStops.map((routeStop: { name: string; value: RouteStop }) => {
		const isSelected = selectedRouteStop && routeStop.name === selectedRouteStop.name;

		return point([routeStop.value.location.longitude, routeStop.value.location.latitude], {
			routeStop,
			routeStopId: routeStop.name,
			statusCategory:
				routeStop.value.dispatch?.category === "priority"
					? routeStop.value.dispatch?.status + "Priority"
					: routeStop.value.dispatch?.status,
			iconTranslate: isSelected ? bounceValue : [0, 0],
		});
	});

	const { setActiveSheet } = useSheetContext();

	const onPointPress = async (event: OnPressEvent) => {
		if (event.features[0].properties?.routeStop) {
			setSelectedRouteStop(event.features[0].properties.routeStop);
			setActiveSheet("routeStop");
		}
	};

	useEffect(() => {
		if (!isChangingLocation) {
			setBounceValue([0, 0]);
			if (selectedRouteStop) {
				let bounce = 0;

				const interval = setInterval(() => {
					bounce = bounce === 0 ? 10 : 0;
					setBounceValue([0, bounce]);
				}, 500);
				return () => clearInterval(interval);
			}
		}
	}, [selectedRouteStop]);

	return (
		<ShapeSource id="orderShape" shape={featureCollection(points)} cluster onPress={onPointPress}>
			<SymbolLayer
				id="pointCount"
				style={{
					textField: ["get", "point_count"],
					textSize: 16,
					textColor: "#ffffff",
					textPitchAlignment: "map",
				}}
			/>
			<CircleLayer
				id="clusteredScooters"
				belowLayerID="pointCount"
				filter={["has", "point_count"]}
				style={{
					circlePitchAlignment: "map",
					circleColor: colors.primary,
					circleRadius: 20,
					circleOpacity: 0.7,
					circleStrokeWidth: 2,
					circleStrokeColor: "white",
				}}
			/>

			<SymbolLayer
				id="symbolLocationSymbols"
				style={{
					iconImage: [
						"match",
						["get", "statusCategory"],
						"Completed",
						"pinGreen",
						"CompletedPriority",
						"pinGreenPriority",
						"Failed",
						"pinRed",
						"FailedPriority",
						"pinRedPriority",
						"Open",
						"pinGray",
						"OpenPriority",
						"pinGrayPriority",
						"pinGray",
					],
					iconSize: 0.35,
					iconAnchor: "bottom",
					iconColor: "blue",
					// iconTranslate: ["get", "iconTranslate"],
				}}
				filter={[
					"all",
					["!", ["has", "point_count"]],
					["!=", ["get", "routeStopId"], selectedRouteStop?.name || ""],
				]}
			/>
			<SymbolLayer
				id="selectedSymbolLocationSymbols"
				style={{
					iconImage: [
						"match",
						["get", "statusCategory"],
						"Completed",
						"pinGreen",
						"CompletedPriority",
						"pinGreenPriority",
						"Failed",
						"pinRed",
						"Open",
						"pinGray",
						"OpenPriority",
						"pinGrayPriority",
						"pinGray",
					],
					iconSize: 0.35,
					iconAnchor: "bottom",
					iconColor: "blue",
					iconTranslate: bounceValue,
				}}
				filter={["==", ["get", "routeStopId"], selectedRouteStop?.name || ""]}
			/>
			<Images images={{ pinGreen, pinGreenPriority, pinRed, pinRedPriority, pinGray, pinGrayPriority }} />
		</ShapeSource>
	);
}
