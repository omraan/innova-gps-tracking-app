import { gql } from "@apollo/client";

export const UPDATE_CUSTOMER = gql`
	mutation UpdateCustomer(
		$id: ID!
		$organizationId: ID!
		$token: String!
		$email: String
		$firstName: String
		$lastName: String
		$companyName: String
		$code: String
		$phoneNumbers: [PhoneInput]
		$notes: String
		$type: CustomerType
		$locationIds: [String]
		$defaultLocationId: String
		$clerkUserId: String
		$modifiedBy: String
		$modifiedAt: Float
	) {
		updateCustomer(
			id: $id
			organizationId: $organizationId
			token: $token
			email: $email
			firstName: $firstName
			lastName: $lastName
			companyName: $companyName
			code: $code
			phoneNumbers: $phoneNumbers
			notes: $notes
			type: $type
			locationIds: $locationIds
			defaultLocationId: $defaultLocationId
			clerkUserId: $clerkUserId
			modifiedBy: $modifiedBy
			modifiedAt: $modifiedAt
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
		$vehicleType: String
		$estimation: RouteMetricsInput
		$actual: RouteMetricsInput
		$stops: JSON
		$createdBy: String
		$createdAt: Float
		$modifiedBy: String
		$modifiedAt: Float
	) {
		updateRoute(
			organizationId: $organizationId
			token: $token
			id: $id
			date: $date
			title: $title
			driverId: $driverId
			vehicleId: $vehicleId
			vehicleType: $vehicleType
			estimation: $estimation
			actual: $actual
			stops: $stops
			createdBy: $createdBy
			createdAt: $createdAt
			modifiedBy: $modifiedBy
			modifiedAt: $modifiedAt
		) {
			name
		}
	}
`;

export const UPDATE_LOCATION = gql`
	mutation UpdateLocation(
		$organizationId: ID!
		$token: String!
		$id: ID!
		$customerId: String
		$title: String
		$streetName: String
		$streetNumber: String
		$city: String
		$postalCode: String
		$country: String
		$latitude: Float
		$longitude: Float
		$notes: String
		$type: LocationType
		$isDefault: Boolean
		$serviceTime: String
		$openingHours: OpeningHoursInput
		$modifiedBy: String
		$modifiedAt: Float
	) {
		updateLocation(
			organizationId: $organizationId
			token: $token
			id: $id
			customerId: $customerId
			title: $title
			streetName: $streetName
			streetNumber: $streetNumber
			city: $city
			postalCode: $postalCode
			country: $country
			latitude: $latitude
			longitude: $longitude
			notes: $notes
			type: $type
			isDefault: $isDefault
			serviceTime: $serviceTime
			openingHours: $openingHours
			modifiedBy: $modifiedBy
			modifiedAt: $modifiedAt
		) {
			name
		}
	}
`;

export const UPDATE_ROUTE_STOP = gql`
	mutation UpdateRouteStop(
		$organizationId: ID!
		$token: String!
		$id: ID!
		$date: String!
		$urlRouteId: String
		$routeId: String
		$locationId: String
		$dispatchId: String
		$transitPointId: String
		$sequence: Int
		$type: StopType
		$dependsOn: [String!]
		$serviceTime: String
		$duration: String
		$distance: String
		$estimatedTimeArrival: String
		$actualTimeArrival: String
		$actualServiceTime: String
		$modifiedBy: String
		$modifiedAt: Float
	) {
		updateRouteStop(
			organizationId: $organizationId
			token: $token
			date: $date
			urlRouteId: $urlRouteId
			id: $id
			routeId: $routeId
			locationId: $locationId
			dispatchId: $dispatchId
			transitPointId: $transitPointId
			sequence: $sequence
			type: $type
			dependsOn: $dependsOn
			serviceTime: $serviceTime
			duration: $duration
			distance: $distance
			estimatedTimeArrival: $estimatedTimeArrival
			actualTimeArrival: $actualTimeArrival
			actualServiceTime: $actualServiceTime
			modifiedBy: $modifiedBy
			modifiedAt: $modifiedAt
		) {
			name
		}
	}
`;

export const UPDATE_ROUTE_STOP_SEQUENCES = gql`
	mutation UpdateRouteStopSequences(
		$organizationId: ID!
		$token: String!
		$routeId: String!
		$stops: [RouteStopSequenceInput!]!
	) {
		updateRouteStopSequences(organizationId: $organizationId, token: $token, routeId: $routeId, stops: $stops) {
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
