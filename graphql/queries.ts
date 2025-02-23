import { gql } from "@apollo/client";

const TimeSlotColumns = gql`
	fragment TimeSlotColumns on TimeSlot {
		startTime
		endTime
	}
`;

const DayScheduleColumns = gql`
	fragment DayScheduleColumns on DaySchedule {
		isOpen
		timeSlots {
			...TimeSlotColumns
		}
	}
	${TimeSlotColumns}
`;

const LocationColumns = gql`
	fragment LocationColumns on Location {
		title
		streetName
		streetNumber
		city
		postalCode
		country
		latitude
		longitude
		notes
		isDefault
		type
		customerId
		serviceTime
		openingHours {
			monday {
				...DayScheduleColumns
			}
			tuesday {
				...DayScheduleColumns
			}
			wednesday {
				...DayScheduleColumns
			}
			thursday {
				...DayScheduleColumns
			}
			friday {
				...DayScheduleColumns
			}
			saturday {
				...DayScheduleColumns
			}
			sunday {
				...DayScheduleColumns
			}
		}
		createdBy
		createdAt
		modifiedBy
		modifiedAt
	}
	${DayScheduleColumns}
`;

const CustomerColumns = gql`
	fragment CustomerColumns on Customer {
		code
		email
		firstName
		lastName
		companyName
		phoneNumbers {
			type
			countryCode
			number
		}
		notes
		locationIds
		type
		clerkUserId
		defaultLocationId
		defaultLocation(token: $token, organizationId: $organizationId) {
			...LocationColumns
		}
	}
	${LocationColumns}
`;

const baseDispatchColumns = `
		customerId
		category
		orders { 
			orderNumber
		}
		trackAndTraceCode
		plannedDeliveryDate
		status
		notes
		createdBy
		createdAt
		modifiedBy
		modifiedAt`;
const DispatchColumns = gql`fragment DispatchColumns on Dispatch { ${baseDispatchColumns} }`;
const DispatchEventColumns = gql`fragment DispatchEventColumns on DispatchEvent { ${baseDispatchColumns} }`;

const TransitPointColumns = gql`
	fragment TransitPointColumns on TransitPoint {
		title
		type
		code
	}
`;
const RouteStopColumns = gql`
	${TransitPointColumns}
	${LocationColumns}
	fragment RouteStopColumns on RouteStop {
		sequence
		type
		locationId
		transitPointId
		location(token: $token, organizationId: $organizationId) {
			...LocationColumns
		}
		estimation {
			duration
			distance
			timeArrival
			timeDeparture
		}
		actual {
			duration
			distance
			timeArrival
			timeDeparture
		}
		dispatch {
			customerId
			locationId
			category
			orders {
				orderNumber
				requiredCapacity {
					volume
					weight
					units
				}
			}
			requirements {
				vehicleType
				capacity {
					volume
					weight
					units
				}
			}
			trackAndTraceCode
			plannedDeliveryDate
			status
			notes
			customer(token: $token, organizationId: $organizationId) {
				code
				email
				firstName
				lastName
				companyName
				phoneNumbers {
					type
					countryCode
					number
				}
			}
		}
		transitPoint(token: $token, organizationId: $organizationId) {
			...TransitPointColumns
		}
	}
`;

export const GET_CUSTOMERS = gql`
	${CustomerColumns}
	${LocationColumns}
	query getCustomers($organizationId: ID!, $token: String!) {
		getCustomers(organizationId: $organizationId, token: $token) {
			name
			value {
				...CustomerColumns
			}
			locations(token: $token, organizationId: $organizationId) {
				name
				value {
					...LocationColumns
				}
			}
		}
	}
`;

export const GET_VEHICLES = gql`
	query getVehicles($organizationId: ID!, $token: String!) {
		getVehicles(organizationId: $organizationId, token: $token) {
			name
			value {
				title
				licensePlate
				earliestStartTime
				latestEndTime
				capacity {
					volume
					weight
					units
				}
				type
				breaks {
					duration
					earliestStartTime
					latestEndTime
				}
				defaultDriverId
			}
		}
	}
`;

export const GET_ORDERS = gql`
	${CustomerColumns}
	query getOrders($organizationId: ID!, $token: String!, $dispatchId: ID!) {
		getOrders(organizationId: $organizationId, token: $token, dispatchId: $dispatchId) {
			name
			value {
				...OrderColumns
			}
		}
	}
`;
export const GET_ORDER_BY_ID = gql`
	${CustomerColumns}
	query getOrderById($organizationId: ID!, $id: ID!, $token: String!, $dispatchId: ID!) {
		getOrderById(organizationId: $organizationId, id: $id, token: $token, dispatchId: $dispatchId) {
			...OrderColumns
		}
	}
`;
export const GET_COUNTRIES = gql`
	query getCountries {
		getCountries {
			name
			value {
				latitude
				longitude
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
	query GetDispatches($organizationId: ID!, $token: String!, $routeId: String!) {
		getDispatches(organizationId: $organizationId, token: $token, routeId: $routeId) {
			name
			value {
				...DispatchColumns
				customer(token: $token, organizationId: $organizationId) {
					...CustomerColumns
				}
			}
		}
	}
`;

export const GET_UNSCHEDULED_DISPATCHES = gql`
	${CustomerColumns}
	${DispatchColumns}
	query GetUnscheduledDispatches($organizationId: ID!, $token: String!) {
		getUnscheduledDispatches(organizationId: $organizationId, token: $token) {
			name
			value {
				...DispatchColumns
				customer(token: $token, organizationId: $organizationId) {
					...CustomerColumns
				}
			}
		}
	}
`;

export const GET_DISPATCH = gql`
	query GetDispatchById($organizationId: ID!, $token: String!, $routeId: ID!, $id: ID!) {
		getDispatchById(organizationId: $organizationId, token: $token, routeId: $routeId, id: $id) {
			customerId
			category
			orders {
				name
				value {
					orderNumber
				}
			}
			trackAndTraceCode
			routeId
			expectedDeliveryDate
			estimatedTimeArrival
			status
			notes
			createdBy
			createdAt
			modifiedBy
			modifiedAt
			customer(token: $token, organizationId: $organizationId) {
				city
				code
				email
				firstName
				lastName
				companyName
				type
				phoneNumber
				phoneNumber2
				phoneNumber3
				notes
			}
		}
	}
`;
export const GET_ROUTES = gql`
	${RouteStopColumns}
	query GetRoutes($organizationId: ID!, $token: String!, $date: String!) {
		getRoutes(organizationId: $organizationId, token: $token, date: $date) {
			name
			value {
				title
				driverId
				vehicleId
				vehicle(token: $token, organizationId: $organizationId) {
					title
					licensePlate
					earliestStartTime
					latestEndTime
					type
					capacity {
						volume
						weight
						units
					}
				}
				estimation {
					duration
					distance
					timeStart
					timeEnd
					geometry
				}
				actual {
					duration
					distance
					timeStart
					timeEnd
					geometry
				}
				stops {
					name
					value {
						...RouteStopColumns
					}
				}
			}
		}
	}
`;

export const GET_LOCATIONS = gql`
	${LocationColumns}
	query GetLocations($organizationId: ID!, $token: String!) {
		getLocations(organizationId: $organizationId, token: $token) {
			name
			value {
				...LocationColumns
			}
		}
	}
`;

export const GET_LOCATION_BY_ID = gql`
	${LocationColumns}
	query GetLocationById($organizationId: ID!, $id: ID!, $token: String!) {
		getLocationById(organizationId: $organizationId, id: $id, token: $token) {
			...LocationColumns
		}
	}
`;

export const GET_LOCATIONS_BY_CUSTOMER_ID = gql`
	${LocationColumns}
	query GetLocationsByCustomerId($organizationId: ID!, $customerId: ID!, $token: String!) {
		getLocationsByCustomerId(organizationId: $organizationId, customerId: $customerId, token: $token) {
			name
			value {
				...LocationColumns
			}
		}
	}
`;

export const GET_TRANSIT_POINTS = gql`
	query GetTransitPoints($organizationId: ID!, $token: String!) {
		getTransitPoints(organizationId: $organizationId, token: $token) {
			name
			value {
				title
				type
				code
				locationId
				location(token: $token, organizationId: $organizationId) {
					streetName
					streetNumber
					city
					postalCode
					country
					latitude
					longitude
				}
				contactPerson
				contactEmail
				contactPhone {
					type
					countryCode
					number
				}
				capacity
				isActive
				notes
				createdBy
				createdAt
				modifiedBy
				modifiedAt
			}
		}
	}
`;

export const GET_TRANSIT_POINT_BY_ID = gql`
	query GetTransitPointById($organizationId: ID!, $id: ID!, $token: String!) {
		getTransitPointById(organizationId: $organizationId, id: $id, token: $token) {
			name
			type
			code
			locationId
			location(token: $token, organizationId: $organizationId) {
				id
				streetName
				streetNumber
				city
				postalCode
				country
				latitude
				longitude
			}
			contactPerson
			contactEmail
			contactPhone {
				type
				countryCode
				number
			}
			capacity
			isActive
			notes
			createdBy
			createdAt
			modifiedBy
			modifiedAt
		}
	}
`;

export const GET_ROUTE_STOPS = gql`
	${RouteStopColumns}
	query GetRouteStops($organizationId: ID!, $token: String!, $date: String!, $routeId: ID!) {
		getRouteStops(organizationId: $organizationId, token: $token, date: $date, routeId: $routeId) {
			...RouteStopColumns
		}
	}
`;

export const GET_ROUTE_STOP_BY_ID = gql`
	${RouteStopColumns}
	query GetRouteStopById($organizationId: ID!, $token: String!, $routeId: ID!, $date: String!, $stopId: ID!) {
		getRouteStopById(
			organizationId: $organizationId
			token: $token
			routeId: $routeId
			date: $date
			stopId: $stopId
		) {
			...RouteStopColumns
		}
	}
`;
