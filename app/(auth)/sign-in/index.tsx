import { useSignIn } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "@rneui/themed/dist/Image";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useNavigation, useRouter } from "expo-router";
import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
	Button,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { useTailwind } from "tailwind-rn";

export default function Page() {
	const { signIn, setActive, isLoaded } = useSignIn();
	const tw = useTailwind();

	const [emailAddress, setEmailAddress] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const navigation = useNavigation();
	const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
	const [isSigningIn, setIsSigning] = useState<boolean>(false);
	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: false,
		});
	}, [navigation]);

	useEffect(() => {
		// Haal het e-mailadres op uit AsyncStorage bij het laden van de component
		const loadEmailAddress = async () => {
			const storedEmail = await AsyncStorage.getItem("emailAddress");
			if (storedEmail) {
				setEmailAddress(storedEmail);
			}
		};
		loadEmailAddress();
	}, []);

	const onSignInPress = useCallback(async () => {
		setErrorMessage(undefined);
		setIsSigning(true);
		if (!isLoaded) {
			return;
		}
		if (!emailAddress) {
			setErrorMessage("Please enter email.");
			return;
		}
		if (!password) {
			setErrorMessage("Please enter password.");
			return;
		}
		try {
			const signInAttempt = await signIn.create({
				identifier: emailAddress,
				password,
			});

			if (signInAttempt.status === "complete") {
				await setActive({ session: signInAttempt.createdSessionId });
				await AsyncStorage.setItem("emailAddress", emailAddress);
			}
		} catch (err: any) {
			setErrorMessage(err.errors[0].message);
			console.error(JSON.stringify(err, null, 2));
		}
		setIsSigning(false);
	}, [isLoaded, emailAddress, password]);
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
		container: tw(`bg-white p-5 w-[90%] m-auto rounded-xl md:w-[50%] lg:min-w-[400px] `),
	});
	return (
		<KeyboardAvoidingView
			style={tw("flex-1 justify-center")}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
				<LinearGradient
					style={tw("h-full justify-center items-center")}
					colors={["#711E92", "#A63058"]}
					start={[0.5, 0]}
					end={[0.5, 1]}
				>
					<View style={tw("mb-10 block")}>
						<Image
							source={require("@/assets/images/logo-transparant.png")}
							style={tw("w-40 h-32 md:w-64 md:h-52 ")}
						/>
					</View>

					<View style={tw(`w-full  lg:w-[40%]`)}>
						<View style={[stylesBox.shadow, stylesBox.container]}>
							{errorMessage ? (
								<View style={tw("mb-5 bg-red-300 border border-red-600 w-full p-3 rounded")}>
									<Text style={tw("text-red-700")}>{errorMessage}</Text>
								</View>
							) : null}

							<View style={tw(`m-auto w-full`)}>
								<Text style={tw("mb-2 text-gray-700")}>Email</Text>
								<TextInput
									style={[
										tw(
											`px-4 border border-gray-300 rounded-lg text-gray-600 text-lg mb-10 w-full mx-auto tracking-wider`
										),
										styles.textInput,
									]}
									value={emailAddress}
									onChangeText={setEmailAddress}
									placeholder="Email"
									autoCapitalize="none"
									keyboardType="email-address"
								/>
								<Text style={tw("mb-2 text-gray-700")}>Password</Text>
								<TextInput
									style={[
										tw(
											`px-4 border border-gray-300 rounded-lg text-gray-600 text-lg mb-10 w-full mx-auto tracking-wider`
										),
										styles.textInput,
									]}
									value={password}
									onChangeText={setPassword}
									placeholder="Password"
									secureTextEntry
								/>
							</View>
							<View>
								<Pressable
									style={tw(
										`py-3 border border-gray-300 rounded-lg bg-primary flex-row justify-center items-center text-lg mb-5 w-full mx-auto ${
											isSigningIn ? "opacity-50" : ""
										}`
									)}
									onPress={onSignInPress}
									disabled={isSigningIn}
								>
									<Text style={tw("text-lg text-white font-bold tracking-wider")}>
										{isSigningIn ? "Logging in" : "Log in"}
									</Text>
								</Pressable>
							</View>
						</View>
					</View>
				</LinearGradient>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	textInput: {
		height: 60, // Pas de hoogte aan naar wens
		textAlign: "left", // Horizontaal centreren
		textAlignVertical: "center", // Verticaal centreren (alleen voor Android)
		lineHeight: 20, // Pas de regelhoogte aan naar wens
	},
});
