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

	const handleSignOut = () => {
		signOut(auth).then(() => console.log("User signed out!"));
	};

	return (
		<SafeAreaView style={tw("h-full bg-white")}>
			<SectionList
				sections={sections}
				keyExtractor={(item, index) => item + index}
				renderItem={({ item }) => <Text style={tw("p-5")}>{item}</Text>}
				renderSectionHeader={({ section: { title } }) => <Text style={tw("p-5 bg-gray-100")}>{title}</Text>}
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
