import { useLazyQuery, useQuery } from "@apollo/client";
import { LinearGradient } from "expo-linear-gradient";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useContext, useEffect, useState } from "react";
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { useTailwind } from "tailwind-rn";
import { auth } from "../../firebase";

export default function SignInScreen() {
	const [email, setEmail] = useState("omraan93@gmail.com");
	const [password, setPassword] = useState("omraan");
	const [loading, setLoading] = useState(false);
	const tw = useTailwind();

	const handleSignIn = async () => {
		// Handle sign-in logic here
		setLoading(true);
		try {
			const response = await signInWithEmailAndPassword(auth, email, password);
		} catch (error: any) {
			console.error(error);
			Alert.alert("Failed to sign in" + error.message);
		}
	};

	return (
		<LinearGradient
			style={tw("h-full")}
			colors={["rgba(99, 102, 241, 1)", "rgba(99, 102, 241, 0.4)"]}
			start={[0, 0]}
			end={[1, 1]}
		>
			<SafeAreaView style={tw(`flex-1 justify-center p-10`)}>
				<Text style={tw(`text-4xl font-bold text-center mb-8 text-white`)}>Innova</Text>
				<View style={tw(`mb-2`)}>
					<TextInput
						style={tw(
							`px-4 pt-1 pb-4 border border-gray-300 rounded-lg text-white text-lg mb-5 w-[80%] mx-auto tracking-wider`
						)}
						value={email}
						onChangeText={setEmail}
						placeholder="Email"
						autoCapitalize="none"
						keyboardType="email-address"
					/>
					<TextInput
						style={tw(
							`px-4 pt-1 pb-4 border border-gray-300 rounded-lg text-white text-lg mb-5 w-[80%] mx-auto tracking-wider`
						)}
						value={password}
						onChangeText={setPassword}
						placeholder="Password"
						secureTextEntry
					/>
				</View>
				<View>
					<Pressable
						style={tw(
							`py-3 border border-gray-300 rounded-lg text-primary bg-white flex-row justify-center items-center text-lg mb-5 w-[80%] mx-auto`
						)}
						onPress={handleSignIn}
					>
						<Text style={tw("text-lg text-primary font-bold tracking-wider")}>Log in</Text>
					</Pressable>
				</View>
			</SafeAreaView>
		</LinearGradient>
	);
}
