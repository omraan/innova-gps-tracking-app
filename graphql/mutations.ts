import { gql } from "@apollo/client";

export const CREATE_VEHICLE = gql`
	mutation CreateVehicle($organizationId: ID!, $token: String!, $name: String!, $licensePlate: String!) {
		insertVehicle(organizationId: $organizationId, token: $token, name: $name, licensePlate: $licensePlate) {
			name
		}
	}
`;

export const UPDATE_VEHICLE = gql`
	mutation UpdateVehicle($id: ID!, $organizationId: ID!, $token: String!, $licensePlate: String, $name: String) {
		updateVehicle(
			id: $id
			organizationId: $organizationId
			token: $token
			licensePlate: $licensePlate
			name: $name
		) {
			name
		}
	}
`;

export const REMOVE_VEHICLE = gql`
	mutation RemoveVehicle($organizationId: ID!, $token: String!, $id: ID!) {
		deleteVehicle(organizationId: $organizationId, token: $token, id: $id) {
			name
		}
	}
`;

export const CREATE_CUSTOMER = gql`
	mutation CreateCustomer(
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
		$phoneNumber3: String
	) {
		insertCustomer(
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
			phoneNumber3: $phoneNumber3
		) {
			name
		}
	}
`;

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

export const REMOVE_CUSTOMER = gql`
	mutation RemoveCustomer($organizationId: ID!, $token: String!, $id: ID!) {
		deleteCustomer(organizationId: $organizationId, token: $token, id: $id) {
			name
		}
	}
`;

export const CREATE_ORDER = gql`
	mutation CreateOrder(
		$organizationId: ID!
		$token: String!
		$createdBy: String
		$createdAt: Float
		$driverId: String
		$vehicleId: String
		$customerId: String!
		$expectedDeliveryDate: String
		$status: String
		$category: String
		$routeIndex: Int
	) {
		insertOrder(
			organizationId: $organizationId
			token: $token
			createdBy: $createdBy
			createdAt: $createdAt
			driverId: $driverId
			vehicleId: $vehicleId
			customerId: $customerId
			expectedDeliveryDate: $expectedDeliveryDate
			status: $status
			category: $category
			routeIndex: $routeIndex
		) {
			name
		}
	}
`;

export const UPDATE_ORDER = gql`
	mutation UpdateOrder(
		$id: ID!
		$organizationId: ID!
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
	) {
		updateOrder(
			id: $id
			organizationId: $organizationId
			token: $token
			modifiedBy: $modifiedBy
			modifiedAt: $modifiedAt
			driverId: $driverId
			vehicleId: $vehicleId
			customerId: $customerId
			expectedDeliveryDate: $expectedDeliveryDate
			status: $status
			category: $category
			routeIndex: $routeIndex
		) {
			name
		}
	}
`;

export const REMOVE_ORDER = gql`
	mutation RemoveOrder($organizationId: ID!, $token: String!, $id: ID!) {
		deleteOrder(organizationId: $organizationId, token: $token, id: $id) {
			name
		}
	}
`;
