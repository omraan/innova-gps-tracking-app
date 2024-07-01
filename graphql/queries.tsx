import { gql } from "@apollo/client";

const OrganisationColumns = gql`
	fragment OrganisationColumns on Organisation {
		name
		settings {
			address
			country
			lat
			lng
			statusCategories {
				name
				color
			}
		}
	}
`;

const UserColumns = gql`
	fragment UserColumns on User {
		name
		email
		status
		isAdmin
		selectedOrganisationId
		location {
			latitude
			longitude
			timestamp
		}
	}
`;

const CustomerColumns = gql`
	fragment CustomerColumns on Customer {
		city
		lat
		code
		email
		lng
		name
		phone_number
		phone_number_2
		streetName
		streetNumber
		streetSuffix
	}
`;
// Since Order and OrderEvent share the same columns, we can use the same fragment for both
const baseOrderColumns = "expectedDeliveryDate vehicleId driverId customerId status";
const OrderColumns = gql`fragment OrderColumns on Order { ${baseOrderColumns} }`;
const OrderEventColumns = gql`fragment OrderEventColumns on OrderEvent { ${baseOrderColumns} }`;

export const GET_CUSTOMERS = gql`
	${CustomerColumns}
	query getCustomers($organisationId: ID!, $token: String!) {
		getCustomers(organisationId: $organisationId, token: $token) {
			name
			value {
				...CustomerColumns
			}
		}
	}
`;
export const GET_ORGANISATIONS = gql`
	${OrganisationColumns}
	query getOrganisations($token: String!) {
		getOrganisations(token: $token) {
			name
			value {
				...OrganisationColumns
			}
		}
	}
`;
export const GET_ORGANISATION_BY_ID = gql`
	${OrganisationColumns}
	query getOrganisationById($id: ID!, $token: String) {
		getOrganisationById(id: $id, token: $token) {
			...OrganisationColumns
		}
	}
`;

export const GET_USERS = gql`
	${UserColumns}
	query getUsers($token: String!) {
		getUsers(token: $token) {
			name
			value {
				...UserColumns
			}
		}
	}
`;

export const GET_USER_BY_ID = gql`
	${UserColumns}
	query getUserById($id: ID!, $token: String!) {
		getUserById(id: $id, token: $token) {
			...UserColumns
		}
	}
`;

export const GET_USER_ID_BY_EMAIL = gql`
	query getUserIdByEmail($email: String!, $token: String!) {
		getUserIdByEmail(email: $email, token: $token) {
			userId
		}
	}
`;

export const GET_VEHICLES = gql`
	query getVehicles($organisationId: ID!, $token: String!) {
		getVehicles(organisationId: $organisationId, token: $token) {
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
	query getOrders($organisationId: ID!, $token: String!) {
		getOrders(organisationId: $organisationId, token: $token) {
			name
			value {
				...OrderColumns
				customer(token: $token, organisationId: $organisationId) {
					...CustomerColumns
				}
				driver(token: $token) {
					email
					name
				}
				vehicle(token: $token, organisationId: $organisationId) {
					licensePlate
					name
				}
				events {
					createdBy
					createdAt
					name
					description
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
	query getOrderById($organisationId: ID!, $id: ID!, $token: String!) {
		getOrderById(organisationId: $organisationId, id: $id, token: $token) {
			...OrderColumns
			customer(token: $token, organisationId: $organisationId) {
				...CustomerColumns
			}
			driver(token: $token) {
				email
				name
			}
			vehicle(token: $token, organisationId: $organisationId) {
				licensePlate
				name
			}
			events {
				createdBy
				createdAt
				name
				description
				...OrderEventColumns
			}
		}
	}
`;
export const GET_USER_ORGANISATIONS_BY_USER_ID = gql`
	${OrganisationColumns}
	${UserColumns}
	query getUserOrganisationsByUserId($token: String!) {
		getUserOrganisationsByUserId(token: $token) {
			name
			value {
				role
				userId
				user(token: $token) {
					...UserColumns
				}
				organisationId
				organisation(token: $token) {
					...OrganisationColumns
				}
			}
		}
	}
`;

export const GET_USER_ORGANISATIONS_BY_ORGANISATION_ID = gql`
	${OrganisationColumns}
	${UserColumns}
	query getUserOrganisationsByOrganisationId($organisationId: ID!, $token: String!) {
		getUserOrganisationsByOrganisationId(organisationId: $organisationId, token: $token) {
			name
			value {
				role
				userId
				user(token: $token) {
					...UserColumns
				}
				organisationId
				organisation(token: $token) {
					...OrganisationColumns
				}
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
