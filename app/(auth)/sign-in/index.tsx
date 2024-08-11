import { useSignIn } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useNavigation, useRouter } from "expo-router";
import React, { useCallback, useLayoutEffect, useState } from "react";
import { Button, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTailwind } from "tailwind-rn";

export default function Page() {
	const { signIn, setActive, isLoaded } = useSignIn();
	const router = useRouter();
	const tw = useTailwind();

	const [emailAddress, setEmailAddress] = useState("omraan93@gmail.com");
	const [password, setPassword] = useState("OTinnova01!");
	const navigation = useNavigation();

	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: false,
		});
	}, [navigation]);

	const onSignInPress = useCallback(async () => {
		if (!isLoaded) {
			return;
		}

		try {
			const signInAttempt = await signIn.create({
				identifier: emailAddress,
				password,
			});

			if (signInAttempt.status === "complete") {
				await setActive({ session: signInAttempt.createdSessionId });
				router.replace("/");
			} else {
				// See https://clerk.com/docs/custom-flows/error-handling
				// for more info on error handling
				console.error(JSON.stringify(signInAttempt, null, 2));
			}
		} catch (err: any) {
			console.error(JSON.stringify(err, null, 2));
		}
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
		container: tw(
			`bg-white p-5 w-[90%] m-auto rounded-xl -mt-20 md:w-[50%] lg:min-w-[400px] lg:-ml-20 lg:mt-auto `
		),
	});
	return (
		<KeyboardAvoidingView
			style={tw("flex-1 justify-center")}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
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
				<View style={tw(`h-[40%] w-full lg:h-[100%] lg:w-[40%]`)}>
					<View style={[stylesBox.shadow, stylesBox.container]}>
						<View style={tw(`m-auto w-full`)}>
							<Text style={tw("mb-2 text-gray-700")}>Email</Text>
							<TextInput
								style={tw(
									`px-4 pt-3 h-16 pb-4 border border-gray-300 rounded-lg text-gray-600 text-lg mb-10 w-full mx-auto tracking-wider`
								)}
								value={emailAddress}
								onChangeText={setEmailAddress}
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
								onPress={onSignInPress}
							>
								<Text style={tw("text-lg text-white font-bold tracking-wider")}>Log in</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</View>
		</KeyboardAvoidingView>
		// <View style={tw("flex-1 justify-center items-center p-4")}>
		// 	<TextInput
		// 		style={tw("border border-gray-300 p-2 rounded-lg w-full mb-4")}
		// 		autoCapitalize="none"
		// 		value={emailAddress}
		// 		placeholder="Email..."
		// 		onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
		// 	/>
		// 	<TextInput
		// 		style={tw("border border-gray-300 p-2 rounded-lg w-full mb-4")}
		// 		value={password}
		// 		placeholder="Password..."
		// 		secureTextEntry={true}
		// 		onChangeText={(password) => setPassword(password)}
		// 	/>
		// 	<Button title="Sign In" onPress={onSignInPress} />
		// </View>
	);
}
