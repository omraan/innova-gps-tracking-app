import colors from "@/colors";
import { useNavigationStore } from "@/hooks/useNavigationStore";
import { LineLayer, ShapeSource } from "@rnmapbox/maps";
import { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position";
import React from "react";
export default function LineRoute({ coordinates }: { coordinates: Position[] }) {
	// const { activeNavigateOption } = useNavigationStore();
	return (
		<ShapeSource
			id="routeLineSource"
			lineMetrics
			shape={{
				properties: {},
				type: "Feature",
				geometry: {
					type: "LineString",
					coordinates: coordinates,
				},
			}}
		>
			<LineLayer
				id="routeLineLayer"
				style={{
					lineColor: colors.secondary,
					lineCap: "round",
					lineJoin: "round",
					lineWidth: 8,
				}}
			/>
		</ShapeSource>
	);
}
