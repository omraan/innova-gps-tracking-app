import colors from "@/colors";
import { LineLayer, ShapeSource } from "@rnmapbox/maps";
import { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position";
import React from "react";
export default function LineRoute({ coordinates }: { coordinates: Position[] }) {
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
					lineWidth: 6,
				}}
			/>
		</ShapeSource>
	);
}
