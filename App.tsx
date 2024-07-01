import { ApolloClient, ApolloProvider, InMemoryCache, createHttpLink, gql, useLazyQuery } from "@apollo/client";
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { NavigationContainer } from "@react-navigation/native";
import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import { onAuthStateChanged, onIdTokenChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { TailwindProvider } from "tailwind-rn";
import { auth, db, ref, set } from "./firebase";
import { GET_USER_BY_ID } from "./graphql/queries";
import { useCustomerStore } from "./hooks/stores/customerStore";
import { useOrderStore } from "./hooks/stores/orderStore";
import { useOrganisationStore } from "./hooks/stores/organisationStore";
import { useUserStore } from "./hooks/stores/userStore";
import { client } from "./lib/client";
import RootNavigator from "./navigator/RootNavigator";
import SignInScreen from "./screens/login/SignInScreen";
import utilities from "./tailwind.json";

type AppContentProps = {
	userId: string | null;
};

const AppContent = ({ userId }: AppContentProps) => {
	const { selectedUser, setSelectedUser } = useUserStore();
	const [getUserById, { data: userData }] = useLazyQuery(GET_USER_BY_ID);
	// const [getCustomersByOrganisationId, { data: customerData }] = useLazyQuery(GET_CUSTOMERS_BY_ORGANISATION_ID);
	const { initCustomers, customers } = useCustomerStore();
	const { initOrganisations, initSelectedOrganisation } = useOrganisationStore();
	const { initOrders, orders } = useOrderStore();

	const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);

	useEffect(() => {
		if (!userId) return;

		getUserById({ variables: { id: userId } });

		const startWatchingLocation = async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				console.error("Permission to access location was denied");
				return;
			}

			const subscription = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.High,
					distanceInterval: 10, // Change location only when the user moved more than 10 meters
					timeInterval: 20000, // Update location every 20 seconds
				},
				(location) => {
					const { latitude, longitude } = location.coords;

					// Send the location to Firebase
					set(ref(db, `users/${userId}/location`), {
						latitude,
						longitude,
						timestamp: Number(new Date()),
					});
				}
			);

			setLocationSubscription(subscription);
		};

		startWatchingLocation();

		return () => {
			if (locationSubscription) {
				locationSubscription.remove();
			}
		};
	}, [userId]);

	useEffect(() => {
		if (userData?.getUserById) {
			setSelectedUser({ ...userData.getUserById, id: userId });
		}
	}, [userData]);

	useEffect(() => {
		const initializeData = async () => {
			if (selectedUser) {
				initCustomers();
				initOrganisations();
				initSelectedOrganisation();
				initOrders();
				onIdTokenChanged(auth, async (user) => {
					if (user) {
						const token = await user.getIdToken();
						await SecureStore.setItemAsync("token", token);
						console.log("Token is refreshed:", token);
					}
				});
			}
		};

		initializeData();
	}, [selectedUser]);

	return selectedUser && userId && customers && orders ? <RootNavigator /> : <SignInScreen />;
};

export default function App() {
	if (__DEV__) {
		// Adds messages only in a dev environment
		loadDevMessages();
		loadErrorMessages();
	}
	const [userId, setUserId] = useState<string | null>(null);

	onAuthStateChanged(auth, (user) => setUserId(user && user.uid));

	return (
		// @ts-ignore - TailwinProvider is missing type definition
		<TailwindProvider utilities={utilities}>
			<ApolloProvider client={client}>
				<NavigationContainer>
					<AppContent userId={userId} />
				</NavigationContainer>
			</ApolloProvider>
		</TailwindProvider>
	);
}
