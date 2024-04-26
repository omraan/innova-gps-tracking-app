import { gql } from "@apollo/client";
export const GET_CUSTOMERS = gql`
	query getCustomers {
		getCustomers {
			name
			value {
				name
				email
				lat
				lng
				organisationId
				code
				city
				streetName
				streetNumber
				streetSuffix
				phone_number
				phone_number_2
			}
		}
	}
`;
export const GET_ORGANISATIONS = gql`
	query getOrganisations {
		getOrganisations {
			name
			value {
				name
				address
				settings {
					order {
						categories
					}
				}
			}
		}
	}
`;
export const GET_USERS = gql`
	query getUsers {
		getUsers {
			name
			value {
				email
				name
				status
				selectedOrganisationId
			}
		}
	}
`;

export const GET_VEHICLES = gql`
	query getVehicles {
		getVehicles {
			name
			value {
				name
				licensePlate
				organisationId
			}
		} #
	}
`;

export const GET_ORDERS = gql`
	query getOrders {
		getOrders {
			name
			value {
				expectedDeliveryDate
				orderCategory
				organisationId
				vehicleId
				driverId
				customerId
				customer {
					email
					lat
					lng
					name
				}
				driver {
					email
					name
				}
				vehicle {
					licensePlate
					name
				}
				events {
					createdBy
					currentIndicator
					description
					name
					status
				}
			}
		}
	}
`;
export const GET_ORDER_BY_ID = gql`
	query getOrderById($id: ID!) {
		getOrderById(id: $id) {
			expectedDeliveryDate
			orderCategory
			organisationId
			vehicleId
			driverId
			customerId
			customer {
				email
				lat
				lng
				name
				code
				city
				streetName
				streetNumber
				streetSuffix
				phone_number
				phone_number_2
			}
			driver {
				email
				name
			}
			vehicle {
				licensePlate
				name
			}
			events {
				createdBy
				currentIndicator
				description
				name
				status
			}
		}
	}
`;
