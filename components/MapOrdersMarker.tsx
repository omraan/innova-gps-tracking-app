import { useOrganization } from "@clerk/clerk-expo";
import React, { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import { useTailwind } from "tailwind-rn";
import SvgMarker from "./svg/SvgMarker";
interface publicMetadata {
	categories: {
		color: string;
		name: string;
	}[];
}

export default function MapOrdersMarker({
	handleSelection,
	order,
}: {
	handleSelection: (order: CustomerOrders) => void;
	order: CustomerOrders;
}) {
	const tw = useTailwind();

	const { organization } = useOrganization();
	const statusCategories: StatusCategory[] = organization?.publicMetadata.statusCategories || [
		{
			color: "#000000",
			name: "Unknown",
		},
	];

	const getPinColor = (status: string) => {
		return (
			statusCategories.find(
				(statusCategory) => status && statusCategory.name.toLocaleLowerCase() === status.toLocaleLowerCase()
			)?.color || "#000000"
		);
	};
	const [pinColor, setPinColor] = useState<string>(getPinColor(order.status!));
	const [tracksViewChanges, setTracksViewChanges] = useState(true);

	useEffect(() => {
		if (order.status) {
			setPinColor(getPinColor(order.status));
		}
	}, [order]);

	useEffect(() => {
		// Zet tracksViewChanges tijdelijk op true om de marker te forceren om opnieuw te renderen
		setTracksViewChanges(true);
		const timeout = setTimeout(() => {
			setTracksViewChanges(false);
		}, 1000); // Zet tracksViewChanges terug naar false na 1 seconde

		return () => clearTimeout(timeout);
	}, [pinColor]);

	if (!order.status) return;

	const publicMetadataOrder = organization?.publicMetadata?.order as publicMetadata;

	return (
		<Marker
			coordinate={{
				latitude: order.customer?.lat,
				longitude: order.customer?.lng,
			}}
			identifier="destination"
			onPress={() => {
				handleSelection(order);
			}}
			style={[tw("z-10")]}
			tracksViewChanges={tracksViewChanges}
		>
			<SvgMarker
				size={45}
				color={pinColor}
				fillColor={
					order.status.toLocaleLowerCase() === "open" &&
					publicMetadataOrder?.categories?.find((category: any) => category.name === order.category)?.color
				}
			/>
		</Marker>
	);
}
