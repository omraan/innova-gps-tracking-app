import { ModalPicker } from "@/components/ModalPicker";
import { GET_VEHICLES } from "@/graphql/queries";
import { useQuery } from "@apollo/client";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useNavigation } from "expo-router";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { SafeAreaView, Text, View } from "react-native";
import { useTailwind } from "tailwind-rn";

export default function Account() {
	const tw = useTailwind();
	const navigation = useNavigation();

	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: "Account",
		});
	}, [navigation]);

	const { user } = useUser();

	const mapViewOptions = [
		{
			value: "standard",
			label: "Standard",
		},
		{
			value: "hybrid",
			label: "Satellite",
		},
	];
	return (
		<SafeAreaView style={tw("h-full bg-white")}>
			<View style={tw("p-5")}>
				<Text style={tw("mb-2 text-gray-600")}>Default Map View</Text>
				{user && (
					<ModalPicker
						key={user?.unsafeMetadata.defaultMapView as string}
						list={mapViewOptions}
						options={{
							defaultValue: user.unsafeMetadata.defaultMapView as string,
						}}
						onSelect={(value) =>
							user.update({
								unsafeMetadata: {
									...user.unsafeMetadata,
									defaultMapView: value,
								},
							})
						}
					/>
				)}
			</View>
		</SafeAreaView>
	);
}
