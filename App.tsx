import { ApolloClient, ApolloProvider, InMemoryCache, createHttpLink, gql } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { NavigationContainer } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";
import { TailwindProvider } from "tailwind-rn";
import RootNavigator from "./navigator/RootNavigator";
import utilities from "./tailwind.json";

export default function App() {
	return (
		// @ts-ignore - TailwinProvider is missing type definition
		<TailwindProvider utilities={utilities}>
			<NavigationContainer>
				<RootNavigator />
			</NavigationContainer>
		</TailwindProvider>
	);
}
