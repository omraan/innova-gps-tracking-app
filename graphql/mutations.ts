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
		$phoneNumber3: String
		$notes: String
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
			phoneNumber3: $phoneNumber3
			notes: $notes
		) {
			name
		}
	}
`;
export const UPDATE_CUSTOMER_ADDRESS = gql`
	mutation UpdateCustomer(
		$id: ID!
		$organizationId: ID!
		$token: String!
		$lat: Float
		$lng: Float
		$city: String
		$streetName: String
		$streetNumber: String
		$notes: String
	) {
		updateCustomer(
			id: $id
			organizationId: $organizationId
			token: $token
			lat: $lat
			lng: $lng
			city: $city
			streetName: $streetName
			streetNumber: $streetNumber
			notes: $notes
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
		$customerId: String
		$orderNumber: String
	) {
		updateOrder(
			id: $id
			organizationId: $organizationId
			token: $token
			date: $date
			modifiedBy: $modifiedBy
			modifiedAt: $modifiedAt
			customerId: $customerId
			orderNumber: $orderNumber
		) {
			name
		}
	}
`;

export const UPDATE_DISPATCH = gql`
	mutation UpdateDispatch(
		$organizationId: ID!
		$token: String!
		$id: ID!
		$routeId: String
		$customerId: String
		$trackAndTraceCode: String
		$expectedDeliveryDate: String
		$estimatedTimeArrival: Int
		$status: String
		$events: [DispatchEventInput]
		$createdAt: Float
		$modifiedAt: Float
		$notes: String
		$orders: [DispatchOrderInput]
		$route: DispatchRouteInput
	) {
		updateDispatch(
			organizationId: $organizationId
			token: $token
			id: $id
			routeId: $routeId
			customerId: $customerId
			trackAndTraceCode: $trackAndTraceCode
			expectedDeliveryDate: $expectedDeliveryDate
			estimatedTimeArrival: $estimatedTimeArrival
			status: $status
			createdAt: $createdAt
			modifiedAt: $modifiedAt
			notes: $notes
			orders: $orders
			events: $events
			route: $route
		) {
			name
		}
	}
`;

export const UPDATE_ROUTE = gql`
	mutation UpdateRoute(
		$organizationId: ID!
		$token: String!
		$id: ID!
		$date: String!
		$title: String
		$driverId: String
		$vehicleId: String
		$startTime: String
		$endTime: String
		$expectedStartTime: String
		$expectedEndTime: String
		$geometry: String
	) {
		updateRoute(
			organizationId: $organizationId
			token: $token
			id: $id
			date: $date
			title: $title
			driverId: $driverId
			vehicleId: $vehicleId
			startTime: $startTime
			endTime: $endTime
			expectedStartTime: $expectedStartTime
			expectedEndTime: $expectedEndTime
			geometry: $geometry
		) {
			name
		}
	}
`;

export const UPDATE_ROUTE_START_TIME = gql`
	mutation UpdateRouteStartTime($organizationId: ID!, $token: String!, $id: ID!, $date: String!, $startTime: String) {
		updateRouteStartTime(
			organizationId: $organizationId
			token: $token
			id: $id
			date: $date
			startTime: $startTime
		) {
			name
		}
	}
`;

export const UPDATE_ROUTE_END_TIME = gql`
	mutation UpdateRouteEndTime($organizationId: ID!, $token: String!, $id: ID!, $date: String!, $endTime: String) {
		updateRouteEndTime(organizationId: $organizationId, token: $token, id: $id, date: $date, endTime: $endTime) {
			name
		}
	}
`;
