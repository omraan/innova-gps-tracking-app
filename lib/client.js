// import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

// export const client = new ApolloClient({
// 	cache: new InMemoryCache(),
// 	link: new HttpLink({
// 		uri: `https://${process.env.EXPO_PUBLIC_STEPZEN_ACCOUNT}.stepzen.net/${process.env.EXPO_PUBLIC_STEPZEN_ENDPOINT}/__graphql`,
// 		headers: {
// 			authorization: `apikey ${process.env.EXPO_PUBLIC_STEPZEN_ACCOUNT}::stepzen.io+1000::${process.env.EXPO_PUBLIC_STEPZEN_API_KEY}`,
// 		},
// 	}),
// });
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, Observable } from "@apollo/client";
import * as SecureStore from "expo-secure-store";

const addVariableMiddleware = new ApolloLink((operation, forward) => {
	return new Observable((observer) => {
		let handle;
		Promise.resolve(operation)
			.then(async (operation) => {
				const token = await SecureStore.getItemAsync("token");
				return { operation, token };
			})
			.then(({ operation, token }) => {
				operation.variables = {
					...operation.variables,
					token: token,
				};
				return operation;
			})
			.then((operation) => {
				handle = forward(operation).subscribe({
					next: observer.next.bind(observer),
					error: observer.error.bind(observer),
					complete: observer.complete.bind(observer),
				});
			})
			.catch(observer.error.bind(observer));

		return () => {
			if (handle) handle.unsubscribe();
		};
	});
});

const httpLink = new HttpLink({
	uri: `https://${process.env.EXPO_PUBLIC_STEPZEN_ACCOUNT}.stepzen.net/${process.env.EXPO_PUBLIC_STEPZEN_ENDPOINT}/__graphql`,
	headers: {
		authorization: `apikey ${process.env.EXPO_PUBLIC_STEPZEN_ACCOUNT}::stepzen.io+1000::${process.env.EXPO_PUBLIC_STEPZEN_API_KEY}`,
	},
});

export const client = new ApolloClient({
	cache: new InMemoryCache(),
	link: addVariableMiddleware.concat(httpLink),
});
