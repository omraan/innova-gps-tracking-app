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
				console.log("Variables >>> ", operation.variables);
				operation.variables = {
					...operation.variables,
					token,
					organizationId,
				};
				return operation;
			})
			.then((operation) => {
				// console.log("Operation: ", operation.variables);
				handle = forward(operation)
					.map((response) => {
						try {
							console.log("Response: ", response);
							if (!response.data || response.data.length === 0) return response;

							const key = Object.keys(response.data)[0];
							response.data = response.data[key];
							if (response.data.length === 0) return response;
							console.log("Response Length: ", response.data.length);
							if (response.data[0] && Object.keys(response.data[0]).find((k) => k === "value")) {
								response.data = response.data.map((item) => {
									const { name: id, value, ...rest } = item;

									return {
										id,
										...rest,
										...value,
									};
								});
							} else {
								response.data = {
									...response.data,
									id: operation.variables.id,
								};
							}
							return response;
						} catch (err) {
							console.error("StepZen error:", err);
							throw err;
						}
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
