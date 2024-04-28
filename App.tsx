import { ApolloClient, ApolloProvider, InMemoryCache, createHttpLink, gql, useLazyQuery } from "@apollo/client";
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { NavigationContainer } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useLayoutEffect, useState } from "react";
import { TailwindProvider } from "tailwind-rn";
import { auth } from "./firebase";
import { GET_CUSTOMERS_BY_ORGANISATION_ID, GET_USER_BY_ID } from "./graphql/queries";
import { useCustomerStore } from "./hooks/stores/customerStore";
import { useOrganisationStore } from "./hooks/stores/organisationStore";
import { useUserStore } from "./hooks/stores/userStore";
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
	const { initCustomers } = useCustomerStore();
	const { initOrganisations, initSelectedOrganisation } = useOrganisationStore();
	useEffect(() => {
		if (userId !== null) {
			getUserById({ variables: { id: userId } });
		}
	}, [userId]);

	useEffect(() => {
		if (userData?.getUserById) {
			console.log("selected org id", userData.getUserById.selectedOrganisationId);
			setSelectedUser(userData.getUserById);
		}
	}, [userData]);

	useEffect(() => {
		if (selectedUser) {
			initCustomers();
			initOrganisations();
			initSelectedOrganisation();
		}
	}, [selectedUser]);

	return selectedUser && userId ? <RootNavigator /> : <SignInScreen />;
};

export default function App() {
	if (__DEV__) {
		// Adds messages only in a dev environment
		loadDevMessages();
		loadErrorMessages();
	}
	const [userId, setUserId] = useState<string | null>(null);

	onAuthStateChanged(auth, (user) => setUserId(user && user.uid));

	const url = `https://${process.env.REACT_APP_STEPZEN_ACCOUNT}.stepzen.net/${process.env.REACT_APP_STEPZEN_ENDPOINT}/__graphql`;

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
				<NavigationContainer>
					<AppContent userId={userId} />
				</NavigationContainer>
			</ApolloProvider>
		</TailwindProvider>
	);
}
