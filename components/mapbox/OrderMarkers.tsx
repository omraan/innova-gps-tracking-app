import pinGrayPriority from "@/assets/images/pin-gray-priority.png";
import pinGray from "@/assets/images/pin-gray.png";
import pinGreenPriority from "@/assets/images/pin-green-priority.png";
import pinGreen from "@/assets/images/pin-green.png";
import pinRedPriority from "@/assets/images/pin-red-priority.png";
import pinRed from "@/assets/images/pin-red.png";

import colors from "@/colors";

import { useOrder } from "@/providers/OrderProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { CircleLayer, Images, ShapeSource, SymbolLayer } from "@rnmapbox/maps";
import { OnPressEvent } from "@rnmapbox/maps/lib/typescript/src/types/OnPressEvent";
import { featureCollection, point } from "@turf/helpers";
import { useEffect, useState } from "react";

export default function OrderMarkers() {
	const { orders, selectedOrder, setSelectedOrder, filteredOrders } = useOrder();

	const [bounceValue, setBounceValue] = useState([0, 0]);

	const points = filteredOrders.map((order: CustomerOrders) => {
		const isSelected = selectedOrder && order.customerId === selectedOrder.customerId;

		return point([order.customer.lng, order.customer.lat], {
			order,
			customerId: order.customerId,
			statusCategory: order.category === "priority" ? order.status + "Priority" : order.status,
			iconTranslate: isSelected ? bounceValue : [0, 0],
		});
	});

	const { setActiveSheet } = useSheetContext();

	const onPointPress = async (event: OnPressEvent) => {
		if (event.features[0].properties?.order) {
			setSelectedOrder(event.features[0].properties.order);
			setActiveSheet("orders");
		}
	};

	useEffect(() => {
		setBounceValue([0, 0]);
		if (selectedOrder) {
			let bounce = 0;

			const interval = setInterval(() => {
				bounce = bounce === 0 ? 10 : 0;
				setBounceValue([0, bounce]);
			}, 500);
			return () => clearInterval(interval);
		}
	}, [selectedOrder]);

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
					["!=", ["get", "customerId"], selectedOrder?.customerId || ""],
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
				filter={["==", ["get", "customerId"], selectedOrder?.customerId || ""]}
			/>
			<Images images={{ pinGreen, pinGreenPriority, pinRed, pinRedPriority, pinGray, pinGrayPriority }} />
		</ShapeSource>
	);
}
