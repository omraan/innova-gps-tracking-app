// import pin from "@/assets/images/pin.svg";
import pin from "@/assets/images/pin.png";
import { useOrder } from "@/providers/OrderProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { CircleLayer, Images, ShapeSource, SymbolLayer } from "@rnmapbox/maps";
import { OnPressEvent } from "@rnmapbox/maps/lib/typescript/src/types/OnPressEvent";
import { featureCollection, point } from "@turf/helpers";
export default function OrderMarkers({ orders }: any) {
	const { setSelectedOrder }: any = useOrder();
	const points = orders.map((order: any) => {
		return point([order.customer.lng, order.customer.lat], { order });
	});
	const { setActiveSheet } = useSheetContext();

	const onPointPress = async (event: OnPressEvent) => {
		if (event.features[0].properties?.order) {
			setSelectedOrder(event.features[0].properties.order);
			setActiveSheet("orders");
		}
	};

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
					circleColor: "#42E100",
					circleRadius: 20,
					circleOpacity: 0.7,
					circleStrokeWidth: 2,
					circleStrokeColor: "white",
				}}
			/>

			<SymbolLayer
				id="symbolLocationSymbols"
				// minZoomLevel={1}
				style={{
					iconImage: "pin",
					// iconAllowOverlap: true,
					iconSize: 0.5,
					iconAnchor: "bottom",
				}}
				filter={["!", ["has", "point_count"]]}
			/>
			<Images images={{ pin }} />
		</ShapeSource>
	);
}
