import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useTailwind } from "tailwind-rn";
interface CustomerMapProps {
	customer: Customer;
}

export const CustomerMap: React.FC<CustomerMapProps> = ({ customer }) => {
	const mapRef = useRef<MapView>(null);
	const tw = useTailwind();

	const delta = 0.009;

	useEffect(() => {
		if (customer.lat && customer.lng) {
			mapRef.current?.animateToRegion(
				{
					latitude: customer.lat,
					longitude: customer.lng,
					latitudeDelta: delta,
					longitudeDelta: delta,
				},
				1000
			);
		}
	}, [customer]);

	return (
		<View style={tw("w-full h-full")}>
			<View style={[{ flex: 1 }]}>
				<MapView
					style={StyleSheet.absoluteFillObject}
					provider={PROVIDER_GOOGLE}
					initialRegion={{
						latitude: customer.lat,
						longitude: customer.lng,
						latitudeDelta: delta,
						longitudeDelta: delta,
					}}
					ref={mapRef}
				>
					{customer.lat && customer.lng && (
						<Marker
							coordinate={{
								latitude: customer.lat,
								longitude: customer.lng,
							}}
							identifier="destination"
						/>
					)}
				</MapView>
			</View>
		</View>
	);
};
