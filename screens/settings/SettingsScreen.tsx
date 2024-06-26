import { useQuery } from "@apollo/client";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Input } from "@rneui/themed";
import { LinearGradient } from "expo-linear-gradient";
import { signOut } from "firebase/auth";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Button, Pressable, SafeAreaView, ScrollView, SectionList, Text, View } from "react-native";
import { useTailwind } from "tailwind-rn";
import { auth } from "../../firebase";
import { RootStackParamList } from "../../navigator/RootNavigator";
import { TabStackParamList } from "../../navigator/TabNavigator";

export type CustomerScreenNavigationProp = CompositeNavigationProp<
	BottomTabNavigationProp<TabStackParamList, "Customers">,
	NativeStackNavigationProp<RootStackParamList>
>;

const SettingsScreen = () => {
	const tw = useTailwind();

	const navigation = useNavigation<CustomerScreenNavigationProp>();
	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: false,
		});
	}, []);

	const sections = [
		{
			title: "Preferences",
			data: ["Account", "Organisation"],
		},
	];

	const handleItemPress = (item: string) => {
		if (item === "Organisation") {
			navigation.navigate("Organisation");
		}
	};

	const handleSignOut = () => {
		signOut(auth);
	};

	return (
		<SafeAreaView style={tw("h-full bg-white")}>
			<SectionList
				sections={sections}
				keyExtractor={(item, index) => item + index}
				renderItem={({ item }) => (
					<View style={tw("border-b border-gray-200 py-2 ")}>
						<Text style={tw("p-5 text-gray-700")} onPress={() => handleItemPress(item)}>
							{item}
						</Text>
					</View>
				)}
				renderSectionHeader={({ section: { title } }) => (
					<View style={[tw("border-b pb-2 border-gray-300")]}>
						<Text style={tw("pt-1 text-lg bg-white text-center font-bold")}>{title}</Text>
					</View>
				)}
				style={tw("flex-1")}
			/>

			<View style={tw("p-5")}>
				<Pressable
					style={tw("bg-red-500 py-3 rounded")}
					onPress={(e) => {
						e.preventDefault();
						handleSignOut();
					}}
				>
					<Text style={tw("text-center text-white font-bold ")}>Log Out</Text>
				</Pressable>
			</View>
		</SafeAreaView>
	);
};

export default SettingsScreen;
