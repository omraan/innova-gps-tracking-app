import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Button, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { useTailwind } from "tailwind-rn";
import { auth } from "../../firebase";
export default function SignInScreen() {
	const [email, setEmail] = useState("test@test.nl");
	const [password, setPassword] = useState("OTtest01!");
	const [loading, setLoading] = useState(false);
	const tw = useTailwind();
	const handleSignIn = async () => {
		// Handle sign-in logic here
		setLoading(true);
		try {
			const response = await signInWithEmailAndPassword(auth, email, password);
		} catch (error: any) {
			console.error(error);
			alert("Failed to sign in" + error.message);
		}
	};

	return (
		<SafeAreaView style={tw(`flex-1 justify-center p-10 bg-gray-100`)}>
			<Text style={tw(`text-4xl font-bold text-center mb-8`)}>Sign In</Text>
			<View style={tw(`mb-4`)}>
				<TextInput
					style={tw(`p-2 border border-gray-300 rounded bg-white mb-5 w-[80%] mx-auto`)}
					value={email}
					onChangeText={setEmail}
					placeholder="Email"
					autoCapitalize="none"
					keyboardType="email-address"
				/>
				<TextInput
					style={tw(`p-2 border border-gray-300 rounded bg-white w-[80%] mx-auto`)}
					value={password}
					onChangeText={setPassword}
					placeholder="Password"
					secureTextEntry
				/>
			</View>
			<View style={tw(`mt-4`)}>
				<Button title="Sign In" onPress={handleSignIn} />
			</View>
		</SafeAreaView>
	);
}
