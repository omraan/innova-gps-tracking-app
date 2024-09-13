import { gql } from "@apollo/client";

export const UPDATE_CUSTOMER = gql`
	mutation UpdateCustomer(
		$id: ID!
		$organizationId: ID!
		$token: String!
		$email: String
		$name: String
		$lat: Float
		$lng: Float
		$code: String
		$city: String
		$streetName: String
		$streetNumber: String
		$phoneNumber: String
		$phoneNumber2: String
	) {
		updateCustomer(
			id: $id
			organizationId: $organizationId
			token: $token
			email: $email
			name: $name
			lat: $lat
			lng: $lng
			code: $code
			city: $city
			streetName: $streetName
			streetNumber: $streetNumber
			phoneNumber: $phoneNumber
			phoneNumber2: $phoneNumber2
		) {
			name
		}
	}
`;

export const UPDATE_ORDER = gql`
	mutation UpdateOrder(
		$id: ID!
		$organizationId: ID!
		$date: String!
		$token: String!
		$modifiedBy: String
		$modifiedAt: Float
		$driverId: String
		$vehicleId: String
		$customerId: String
		$expectedDeliveryDate: String
		$status: String
		$category: String
		$routeIndex: Int
		$notes: String
	) {
		updateOrder(
			id: $id
			organizationId: $organizationId
			token: $token
			date: $date
			modifiedBy: $modifiedBy
			modifiedAt: $modifiedAt
			driverId: $driverId
			vehicleId: $vehicleId
			customerId: $customerId
			expectedDeliveryDate: $expectedDeliveryDate
			status: $status
			category: $category
			routeIndex: $routeIndex
			notes: $notes
		) {
			name
		}
	}
`;

export const REMOVE_ORDER = gql`
	mutation RemoveOrder($organizationId: ID!, $token: String!, $id: ID!, $date: String!) {
		deleteOrder(organizationId: $organizationId, token: $token, id: $id, date: $date) {
			name
		}
	}
`;

export const CREATE_ROUTE_SESSION = gql`
	mutation CreateRouteSession(
		$organizationId: ID!
		$token: String!
		$date: String!
		$driverId: String
		$vehicleId: String
		$startTime: String
		$endTime: String
	) {
		insertRouteSession(
			organizationId: $organizationId
			token: $token
			date: $date
			driverId: $driverId
			vehicleId: $vehicleId
			startTime: $startTime
			endTime: $endTime
		) {
			name
		}
	}
`;

export const UPDATE_ROUTE_SESSION = gql`
	mutation UpdateRouteSession(
		$id: ID!
		$organizationId: ID!
		$token: String!
		$date: String!
		$driverId: String
		$vehicleId: String
		$startTime: String
		$endTime: String
	) {
		updateRouteSession(
			id: $id
			organizationId: $organizationId
			token: $token
			date: $date
			driverId: $driverId
			vehicleId: $vehicleId
			startTime: $startTime
			endTime: $endTime
		) {
			name
		}
	}
`;
export const REMOVE_ROUTE_SESSION = gql`
	mutation RemoveRouteSession($organizationId: ID!, $token: String!, $id: ID!, $date: String!) {
		deleteRouteSession(organizationId: $organizationId, token: $token, id: $id, date: $date) {
			name
		}
	}
`;
