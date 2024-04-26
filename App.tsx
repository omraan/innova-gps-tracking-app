import { ApolloClient, ApolloProvider, InMemoryCache, createHttpLink, gql } from "@apollo/client";
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { NavigationContainer } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useLayoutEffect, useState } from "react";
import { TailwindProvider } from "tailwind-rn";
import { auth } from "./firebase";
import RootNavigator from "./navigator/RootNavigator";
import SignInScreen from "./screens/login/SignInScreen";
import utilities from "./tailwind.json";
export default function App() {
	// if (__DEV__) {
	// 	// Adds messages only in a dev environment
	// 	loadDevMessages();
	// 	loadErrorMessages();
	// }
	const [initializing, setInitializing] = useState(true);
	const [user, setUser] = useState(null);

	const url = `https://${process.env.REACT_APP_STEPZEN_ACCOUNT}.stepzen.net/${process.env.REACT_APP_STEPZEN_ENDPOINT}/__graphql`;
	// Handle user state changes
	function onAuthStateChange(user: any) {
		setUser(user);
		if (initializing) setInitializing(false);
	}

	useEffect(() => {
		const subscriber = onAuthStateChanged(auth, onAuthStateChange);
		return subscriber; // unsubscribe on unmount
	}, []);

	if (initializing) {
		return null; // or a loading spinner
	}
	console.log("URL is: ", url);

	const client = new ApolloClient({
		uri: url,
		headers: {
			authorization: `apikey ${process.env.REACT_APP_STEPZEN_ACCOUNT}::stepzen.io+1000::${process.env.REACT_APP_STEPZEN_API_KEY}`,
		},
		cache: new InMemoryCache(),
	});

	return (
		// @ts-ignore - TailwinProvider is missing type definition
		<TailwindProvider utilities={utilities}>
			<ApolloProvider client={client}>
				<NavigationContainer>{user ? <RootNavigator /> : <SignInScreen />}</NavigationContainer>
				{/* <NavigationContainer>
					<RootNavigator />
				</NavigationContainer> */}
			</ApolloProvider>
		</TailwindProvider>
	);
}
