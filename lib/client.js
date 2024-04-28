import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

export const client = new ApolloClient({
	cache: new InMemoryCache(),
	link: new HttpLink({
		uri: `https://${process.env.REACT_APP_STEPZEN_ACCOUNT}.stepzen.net/${process.env.REACT_APP_STEPZEN_ENDPOINT}/__graphql`,
		headers: {
			authorization: `apikey ${process.env.REACT_APP_STEPZEN_ACCOUNT}::stepzen.io+1000::${process.env.REACT_APP_STEPZEN_API_KEY}`,
		},
	}),
});
