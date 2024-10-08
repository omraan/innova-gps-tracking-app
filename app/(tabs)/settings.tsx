import LoadingScreen from "@/components/LoadingScreen";
import { client } from "@/graphql/client";
import { useAuth, useUser } from "@clerk/clerk-expo";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, SafeAreaView, SectionList, Text, View } from "react-native";
import { useTailwind } from "tailwind-rn";

export default function Settings() {
	const tw = useTailwind();
	const router = useRouter();
	const { signOut, isSignedIn } = useAuth();
	const expoConfig = Constants.expoConfig;

	const { user } = useUser();

	useEffect(() => {
		if (!isSignedIn) {
			router.navigate("/sign-in");
		}
	}, [isSignedIn]);

	const sections = [
		{
			data: ["Account", "Organisation"],
		},
	];
	const handleItemPress = (item: string) => {
		if (item === "Organisation") {
			router.push({ pathname: "/settings/organisation" });
		}
		if (item === "Account") {
			router.push({ pathname: "/settings/account" });
		}
	};

	const handleLogout = async () => {
		await client.clearStore();
		signOut();
	};

	return (
		<SafeAreaView style={tw("h-full bg-white")}>
			<SectionList
				sections={sections}
				keyExtractor={(item, index) => item + index}
				renderItem={({ item }) => (
					<Pressable>
						<View style={tw("border-b border-gray-200 py-2")}>
							<Text style={tw("p-5 text-gray-700")} onPress={() => handleItemPress(item)}>
								{item}
							</Text>
						</View>
					</Pressable>
				)}
				style={tw("flex-1")}
			/>

			<View style={tw("p-5")}>
				<View style={tw("mb-5")}>
					<Text>User: {user?.primaryEmailAddress?.toString() || ""}</Text>
					<Text>Version: {expoConfig?.version}</Text>
					<Text>Build Number: {expoConfig?.android?.versionCode || expoConfig?.ios?.buildNumber}</Text>
				</View>
				<Pressable style={tw("bg-red-500 py-3 rounded")} onPress={handleLogout}>
					<Text style={tw("text-center text-white font-bold ")}>Log Out</Text>
				</Pressable>
			</View>
		</SafeAreaView>
	);
}
