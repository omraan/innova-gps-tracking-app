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
const baseOrderColumns = "customerId orderNumber modifiedAt";
const OrderColumns = gql`fragment OrderColumns on Order { ${baseOrderColumns} }`;

const baseDispatchColumns = `
		customerId
		category
		orders { orderId orderNumber}
		trackAndTraceCode
		routeId
		expectedDeliveryDate
		estimatedTimeArrival
		status
		notes
		createdBy
		createdAt
		modifiedBy
		modifiedAt`;
const DispatchColumns = gql`fragment DispatchColumns on Dispatch { ${baseDispatchColumns} }`;
const DispatchEventColumns = gql`fragment DispatchEventColumns on DispatchEvent { ${baseDispatchColumns} }`;

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
	query getOrders($organizationId: ID!, $token: String!) {
		getOrders(organizationId: $organizationId, token: $token) {
			name
			value {
				...OrderColumns
			}
		}
	}
`;
export const GET_ORDER_BY_ID = gql`
	${CustomerColumns}
	query getOrderById($organizationId: ID!, $id: ID!, $token: String!) {
		getOrderById(organizationId: $organizationId, id: $id, token: $token) {
			...OrderColumns
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
export const GET_TRACK_AND_TRACE_INDEX_BY_CODE = gql`
	query getTrackAndTraceIndexByCode($token: String!, $trackAndTraceCode: String!) {
		getTrackAndTraceIndexByCode {
			name
			value {
				routeId
				dispatchId
				organizationId
			}
		}
	}
`;

// export const GET_ROUTE_SESSIONS = gql`
// 	query getRouteSessions($date: String!, $organizationId: ID!, $token: String!) {
// 		getRouteSessions(date: $date, organizationId: $organizationId, token: $token) {
// 			name
// 			value {
// 				driverId
// 				vehicleId
// 				startTime
// 				endTime
// 			}
// 		}
// 	}
// `;
export const GET_ROUTE_LOCATIONS = gql`
	query getRouteLocations($organizationId: ID!, $token: String!, $date: String!, $route: ID!) {
		getRouteLocations(organizationId: $organizationId, token: $token, date: $date, route: $route) {
			name
			value {
				latitude
				longitude
				speed
				speedInKmh
				timestamp
			}
		}
	}
`;

export const GET_DISPATCHES = gql`
	${CustomerColumns}
	${DispatchColumns}
	${DispatchEventColumns}
	query GetDispatches($organizationId: ID!, $token: String!, $routeId: String!) {
		getDispatches(organizationId: $organizationId, token: $token, routeId: $routeId) {
			name
			value {
				...DispatchColumns
				customer(token: $token, organizationId: $organizationId) {
					...CustomerColumns
				}
				events {
					name
					description
					...DispatchEventColumns
				}
				route {
					index
					duration
					distance
					estimatedTimeArrival
				}
			}
		}
	}
`;

export const GET_UNSCHEDULED_DISPATCHES = gql`
	${CustomerColumns}
	${DispatchColumns}
	${DispatchEventColumns}
	query GetUnscheduledDispatches($organizationId: ID!, $token: String!) {
		getUnscheduledDispatches(organizationId: $organizationId, token: $token) {
			name
			value {
				...DispatchColumns
				customer(token: $token, organizationId: $organizationId) {
					...CustomerColumns
				}
				events {
					name
					description
					...DispatchEventColumns
				}
			}
		}
	}
`;

export const GET_DISPATCH = gql`
	query GetDispatch($trackAndTraceCode: String!) {
		getDispatch(trackAndTraceCode: $trackAndTraceCode) {
			id
			...DispatchColumns
			customer(token: $token, organizationId: $organizationId) {
				...CustomerColumns
			}
			route {
				index
				duration
				distance
				estimatedTimeArrival
			}
			events {
				name
				description
				...DispatchColumns
			}
		}
	}
`;
export const GET_ROUTES = gql`
	query GetRoutes($organizationId: ID!, $token: String!, $date: String!) {
		getRoutes(organizationId: $organizationId, token: $token, date: $date) {
			name
			value {
				title
				driverId
				vehicleId
				vehicle(token: $token, organizationId: $organizationId) {
					name
					licensePlate
				}
				startTime
				endTime
				expectedStartTime
				expectedEndTime
				geometry
			}
		}
	}
`;

// export const GET_ROUTE_BY_ID = gql`
// 	${CustomerColumns}
// 	${DispatchColumns}
// 	${DispatchEventColumns}
// 	query GetRouteById($organizationId: ID!, $token: String!, $date: String!, $routeId: String!) {
// 		getRouteById(organizationId: $organizationId, token: $token, date: $date, routeId: $routeId) {
// 			name
// 			value {
// 				title
// 				driverId
// 				vehicleId
// 				vehicle(token: $token, organizationId: $organizationId) {
// 					name
// 					licensePlate
// 				}
// 				startTime
// 				endTime
// 				expectedStartTime
// 				expectedEndTime
// 				geometry
// 				dispatches(token: $token, organizationId: $organizationId, routeId: ID!) {
// 					name
// 					value {
// 						...DispatchColumns
// 						customer(token: $token, organizationId: $organizationId, routeId: $routeId) {
// 							...CustomerColumns
// 						}
// 						events {
// 							name
// 							description
// 							...DispatchEventColumns
// 						}
// 						route {
// 							index
// 							duration
// 							distance
// 							estimatedTimeArrival
// 						}
// 					}
// 				}
// 			}

// 		}
// 	}
// `;
