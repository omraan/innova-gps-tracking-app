import pinGray from "@/assets/images/pin-gray.png";
import pinGreen from "@/assets/images/pin-green.png";
import pinRed from "@/assets/images/pin-red.png";
import colors from "@/colors";

import { useOrder } from "@/providers/OrderProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { CircleLayer, Images, ShapeSource, SymbolLayer } from "@rnmapbox/maps";
import { OnPressEvent } from "@rnmapbox/maps/lib/typescript/src/types/OnPressEvent";
import { featureCollection, point } from "@turf/helpers";

// interface OrderIcon {
// 	color: string;
// 	status: string;
// }
export default function OrderMarkers({ orders }: any) {
	const { setSelectedOrder }: any = useOrder();
	const points = orders.map((order: any) => {
		return point([order.customer.lng, order.customer.lat], { order, status: order.status });
	});

	const { setActiveSheet } = useSheetContext();

	const onPointPress = async (event: OnPressEvent) => {
		if (event.features[0].properties?.order) {
			setSelectedOrder(event.features[0].properties.order);
			setActiveSheet("orders");
		}
	};

	// console.log("test", JSON.stringify(featureCollection(points), null, 2));

	// const icon: OrderIcon[] = [
	// 	{
	// 		color: "Green",
	// 		status: "completed",
	// 	},
	// 	{
	// 		color: "Red",
	// 		status: "failed",
	// 	},
	// 	{
	// 		color: "Gray",
	// 		status: "open",
	// 	},
	// ];

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
						["get", "status"],
						"Completed",
						"pinGreen",
						"Failed",
						"pinRed",
						"open",
						"pinGray",
						"pinGray",
					],
					iconSize: 0.35,
					iconAnchor: "bottom",
					iconColor: "blue",
				}}
				filter={["!", ["has", "point_count"]]}
			/>
			<Images images={{ pinGreen, pinRed, pinGray }} />
		</ShapeSource>
	);
}
