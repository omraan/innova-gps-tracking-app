import { useLazyQuery, useQuery } from "@apollo/client";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useContext, useEffect, useState } from "react";
import { Alert, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { useTailwind } from "tailwind-rn";
import { auth } from "../../firebase";

export default function SignInScreen() {
	const [email, setEmail] = useState("omraan93@gmail.com");
	const [password, setPassword] = useState("omraan");
	const [loading, setLoading] = useState(false);
	const tw = useTailwind();

	const saveToken = async (token: any) => {
		try {
			await SecureStore.setItemAsync("token", token);
		} catch (error) {
			console.error("Failed to save the token", error);
		}
	};

	const handleSignIn = async () => {
		// Handle sign-in logic here

		setLoading(true);
		try {
			const response: any = await signInWithEmailAndPassword(auth, email, password);
			const idToken = response._tokenResponse.idToken;
			// console.log(idToken);
			await saveToken(idToken);
		} catch (error: any) {
			console.error(error);
			Alert.alert("Failed to sign in" + error.message);
		} finally {
			setLoading(false);
		}
	};
	const stylesBox = StyleSheet.create({
		shadow: {
			...Platform.select({
				ios: {
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 1 },
					shadowOpacity: 0.025,
					shadowRadius: 20,
				},
				android: {
					elevation: 20,
				},
			}),
		},
		container: tw(
			`bg-white p-10 w-[75%] m-auto rounded-xl -mt-20 md:w-[50%] lg:min-w-[400px] lg:-ml-20 lg:mt-auto `
		),
	});

	return (
		<View style={tw("bg-gray-100 lg:flex-row")}>
			<LinearGradient
				style={tw("h-[60%] lg:h-[100%] lg:w-[60%] justify-center items-center")}
				colors={["rgba(120, 50, 180, 1)", "rgba(120, 50, 180, 0.7)", "rgba(120, 50, 180, 1)"]}
				start={[0, 0]}
				end={[1, 1]}
			>
				<View style={tw(`rounded-full w-60 h-60 border-8 border-white flex justify-center items-center `)}>
					<Text style={tw(`text-4xl font-bold text-center text-white`)}>Innova</Text>
				</View>
			</LinearGradient>
			<View style={tw(`h-[40%] lg:h-[100%] lg:w-[40%]`)}>
				<View style={[stylesBox.shadow, stylesBox.container]}>
					<View style={tw(`m-auto w-full`)}>
						<Text style={tw("mb-2 text-gray-700")}>Email</Text>
						<TextInput
							style={tw(
								`px-4 pt-3 h-16 pb-4 border border-gray-300 rounded-lg text-gray-600 text-lg mb-10 w-full mx-auto tracking-wider`
							)}
							value={email}
							onChangeText={setEmail}
							placeholder="Email"
							autoCapitalize="none"
							keyboardType="email-address"
						/>
						<Text style={tw("mb-2 text-gray-700")}>Password</Text>
						<TextInput
							style={tw(
								`px-4 pt-3 h-16 pb-4 border border-gray-300 rounded-lg text-gray-600 text-lg mb-10 w-full mx-auto tracking-wider`
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
								`py-3 border border-gray-300 rounded-lg bg-primary flex-row justify-center items-center text-lg mb-5 w-full mx-auto`
							)}
							onPress={handleSignIn}
						>
							<Text style={tw("text-lg text-white font-bold tracking-wider")}>Log in</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</View>
	);
}
