import { ModalPicker } from "@/components/ModalPicker";
import { useAuth, useOrganizationList } from "@clerk/clerk-expo";
import { useNavigation } from "expo-router";
import React, { useEffect, useLayoutEffect } from "react";
import { Pressable, SafeAreaView, SectionList, Text, View } from "react-native";
import { useTailwind } from "tailwind-rn";

function Organisation() {
	const tw = useTailwind();
	const navigation = useNavigation();
	const { userMemberships, setActive, isLoaded } = useOrganizationList({
		userMemberships: true,
	});

	const { orgId } = useAuth();

	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: "Organisation",
		});
	}, [navigation]);

	if (!isLoaded) {
		return (
			<SafeAreaView style={tw("h-full bg-white flex items-center justify-center")}>
				<Text style={tw("text-center text-gray-500")}>Loading...</Text>
			</SafeAreaView>
		);
	}

	const data: any = userMemberships.data || [];

	return (
		<SafeAreaView style={tw("h-full bg-white")}>
			<View style={tw("p-5")}>
				<Text style={tw("mb-2 text-gray-600")}>Selected Organization</Text>
				{data.length > 0 && (
					<ModalPicker
						list={data.map((mem: any) => {
							return {
								value: mem.organization.id,
								label: mem.organization.name,
							};
						})}
						currentItem={orgId!}
						onChange={(value) => setActive({ organization: value })}
					/>
				)}
			</View>
		</SafeAreaView>
	);
}

export default Organisation;
