import pinGrayPriority from "@/assets/images/pin-gray-priority.png";
import pinGray from "@/assets/images/pin-gray.png";
import pinGreenPriority from "@/assets/images/pin-green-priority.png";
import pinGreen from "@/assets/images/pin-green.png";
import pinRedPriority from "@/assets/images/pin-red-priority.png";
import pinRed from "@/assets/images/pin-red.png";

import colors from "@/colors";

import { useDispatch } from "@/providers/DispatchProvider";
import { useLocation } from "@/providers/LocationProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { CircleLayer, Images, ShapeSource, SymbolLayer } from "@rnmapbox/maps";
import { OnPressEvent } from "@rnmapbox/maps/lib/typescript/src/types/OnPressEvent";
import { featureCollection, point } from "@turf/helpers";
import { useEffect, useState } from "react";

export default function OrderMarkers() {
	const { selectedDispatch, setSelectedDispatch, filteredDispatches } = useDispatch();
	const { isChangingLocation } = useLocation();

	const [bounceValue, setBounceValue] = useState([0, 0]);

	const points = filteredDispatches.map((dispatch: { name: string; value: DispatchExtended }) => {
		const isSelected = selectedDispatch && dispatch.value.customerId === selectedDispatch.value.customerId;

		return point([dispatch.value.customer.lng, dispatch.value.customer.lat], {
			dispatch,
			customerId: dispatch.value.customerId,
			statusCategory:
				dispatch.value.category === "priority" ? dispatch.value.status + "Priority" : dispatch.value.status,
			iconTranslate: isSelected ? bounceValue : [0, 0],
		});
	});

	const { setActiveSheet } = useSheetContext();

	const onPointPress = async (event: OnPressEvent) => {
		if (event.features[0].properties?.dispatch) {
			setSelectedDispatch(event.features[0].properties.dispatch);
			setActiveSheet("dispatches");
		}
	};

	useEffect(() => {
		if (!isChangingLocation) {
			setBounceValue([0, 0]);
			if (selectedDispatch) {
				let bounce = 0;

				const interval = setInterval(() => {
					bounce = bounce === 0 ? 10 : 0;
					setBounceValue([0, bounce]);
				}, 500);
				return () => clearInterval(interval);
			}
		}
	}, [selectedDispatch]);

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
					["!=", ["get", "customerId"], selectedDispatch?.value.customerId || ""],
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
				filter={["==", ["get", "customerId"], selectedDispatch?.value.customerId || ""]}
			/>
			<Images images={{ pinGreen, pinGreenPriority, pinRed, pinRedPriority, pinGray, pinGrayPriority }} />
		</ShapeSource>
	);
}
