import { gql } from "@apollo/client";

const CustomerColumns = gql`
	fragment CustomerColumns on Customer {
		city
		lat
		code
		email
		lng
		name
		phoneNumber
		phoneNumber2
		phoneNumber3
		streetName
		streetNumber
		notes
	}
`;
// Since Order and OrderEvent share the same columns, we can use the same fragment for both
const baseOrderColumns =
	"expectedDeliveryDate vehicleId driverId customerId status category orderNumber notes routeIndex modifiedAt";
const OrderColumns = gql`fragment OrderColumns on Order { ${baseOrderColumns} }`;
const OrderEventColumns = gql`fragment OrderEventColumns on OrderEvent { ${baseOrderColumns} }`;

export const GET_CUSTOMERS = gql`
	${CustomerColumns}
	query getCustomers($organizationId: ID!, $token: String!) {
		getCustomers(organizationId: $organizationId, token: $token) {
			name
			value {
				...CustomerColumns
			}
		}
	}
`;

export const GET_VEHICLES = gql`
	query getVehicles($organizationId: ID!, $token: String!) {
		getVehicles(organizationId: $organizationId, token: $token) {
			name
			value {
				name
				licensePlate
			}
		}
	}
`;

export const GET_ORDERS = gql`
	${CustomerColumns}
	${OrderColumns}
	${OrderEventColumns}
	query getOrders($organizationId: ID!, $token: String!) {
		getOrders(organizationId: $organizationId, token: $token) {
			name
			value {
				...OrderColumns
				customer(token: $token, organizationId: $organizationId) {
					...CustomerColumns
				}

				events {
					createdBy
					createdAt
					name
					status
					notes
					...OrderEventColumns
				}
			}
		}
	}
`;

export const GET_ORDERS_BY_DATE = gql`
	${CustomerColumns}
	${OrderColumns}
	${OrderEventColumns}
	query getOrdersByDate($date: String!, $organizationId: ID!, $token: String!) {
		getOrdersByDate(date: $date, organizationId: $organizationId, token: $token) {
			name
			value {
				...OrderColumns
				customer(token: $token, organizationId: $organizationId) {
					...CustomerColumns
				}
				events {
					createdBy
					createdAt
					name
					status
					notes
					...OrderEventColumns
				}
			}
		}
	}
`;

export const GET_ORDER_BY_ID = gql`
	${CustomerColumns}
	${OrderColumns}
	${OrderEventColumns}
	query getOrderById($organizationId: ID!, $id: ID!, $token: String!) {
		getOrderById(organizationId: $organizationId, id: $id, token: $token) {
			...OrderColumns
			customer(token: $token, organizationId: $organizationId) {
				...CustomerColumns
			}
			events {
				createdBy
				createdAt
				name
				status
				description
				notes
				...OrderEventColumns
			}
		}
	}
`;
export const GET_COUNTRIES = gql`
	query getCountries {
		getCountries {
			name
			value {
				lat
				lng
			}
		}
	}
`;

export const GET_ROUTE_SESSIONS = gql`
	query getRouteSessions($date: String!, $organizationId: ID!, $token: String!) {
		getRouteSessions(date: $date, organizationId: $organizationId, token: $token) {
			name
			value {
				driverId
				vehicleId
				startTime
				endTime
			}
		}
	}
`;
