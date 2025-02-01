import colors from "@/colors";
import { useNavigationStore } from "@/hooks/useNavigationStore";
import { LineLayer, ShapeSource } from "@rnmapbox/maps";
import { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position";
import React from "react";
export default function LineRoute({ coordinates }: { coordinates: Position[] }) {
	const { activeNavigateOption } = useNavigationStore();
	return (
		<ShapeSource
			id="routeSource"
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
				id="exampleLineLayer"
				belowLayerID="symbolLocationSymbols"
				style={{
					lineColor: colors.secondary,
					lineCap: "round",
					lineJoin: "round",
					lineWidth: activeNavigateOption === "navigate" ? 12 : 6,
				}}
			/>
		</ShapeSource>
	);
}
