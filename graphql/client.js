import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, Observable } from "@apollo/client";
import * as SecureStore from "expo-secure-store";

const addVariableMiddleware = new ApolloLink((operation, forward) => {
	return new Observable((observer) => {
		let handle;

		Promise.resolve(operation)
			.then(async (operation) => {
				const token = await SecureStore.getItemAsync("firebaseToken");
				const organizationId = await SecureStore.getItemAsync("orgId");
				return { operation, token, organizationId };
			})
			.then(({ operation, token, organizationId }) => {
				// console.log("Variables >>> ", operation.variables);
				operation.variables = {
					...operation.variables,
					token,
					organizationId,
				};
				return operation;
			})
			.then((operation) => {
				handle = forward(operation)
					.map((response) => {
						const queryName = Object.keys(response.data || {})[0];

						if (!response.data || !queryName) {
							// console.log("response: ", response);
							return response;
						}
						const valueExists = response.data[queryName][0]?.value;

						if (valueExists) {
							response.data[queryName] = response.data[queryName].map((item) => {
								const itemWithId = {
									name: item.name,
									id: item.name,
									value: {
										id: item.name,
										...item.value,
									},
								};
								return itemWithId;
							});
						} else {
							if (operation.variables.id) {
								response.data[queryName] = {
									...response.data[queryName],
									id: operation.variables.id,
								};
							}
						}
						return response;
					})
					.subscribe({
						next: observer.next.bind(observer),
						error: (err) => {
							console.error("StepZen error:", err);
							observer.error(err);
						},
						complete: observer.complete.bind(observer),
					});
			})
			.catch((err) => {
				console.error("StepZen error:", err);
				observer.error(err);
			});

		return () => {
			if (handle) handle.unsubscribe();
		};
	});
});

const httpLink = new HttpLink({
	uri: `https://${process.env.EXPO_PUBLIC_STEPZEN_ACCOUNT}.us-east-a.ibm.stepzen.net/${process.env.EXPO_PUBLIC_STEPZEN_ENDPOINT}/graphql`,
	headers: {
		Authorization: `apikey ${process.env.EXPO_PUBLIC_STEPZEN_ACCOUNT}::local.net+1000::${process.env.EXPO_PUBLIC_STEPZEN_API_KEY}`,
	},
	fetch,
});

export const client = new ApolloClient({
	cache: new InMemoryCache(),
	link: addVariableMiddleware.concat(httpLink),
});
