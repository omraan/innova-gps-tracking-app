type RegisterUser = {
	name: string;
	email: string;
	isAdmin: boolean;
	status?: string;
	selectedOrganisationId?: string;
};

interface User extends RegisterUser {
	id: string;
	token?: string;
	location?: {
		longitude?: number;
		latitude?: number;
		timestamp?: number;
	};
}

type UserOrganisation = {
	userId: string;
	organisationId: string;
	status: string;
	role: string;
};

interface RegisterOrganisation {
	name: string;
	settings: {
		address: string;
		statusCategories: {
			name: string;
			color: string;
		}[];
		country: string;
		lat: number;
		lng: number;
	};
}

interface Organisation extends RegisterOrganisation {
	id: string;
}

interface RegisterCustomer {
	name: string;
	email?: string;
	lat: number;
	lng: number;
	code: string;
	city?: string;
	streetName?: string;
	streetNumber?: number;
	streetSuffix?: string;
	phone_number?: string;
	phone_number_2?: string;
	phone_number_3?: string;
}

interface Customer extends RegisterCustomer {
	id: string;
}

interface RegisterVehicle {
	name: string;
	licensePlate: string;
}

interface Vehicle extends RegisterVehicle {
	id: string;
}

interface RegisterOrder {
	driverId?: string;
	vehicleId?: string;
	customerId?: string;
	expectedDeliveryDate?: number;
	status?: string;
}

interface Order extends RegisterOrder {
	id: string;
	events?: OrderEvent[];
}
interface OrderExtended extends Order {
	driver?: {
		name: string;
		email: string;
	};
	vehicle?: {
		licensePlate: string;
		name: string;
	};
	customer: {
		lat: number;
		lng: number;
		name: string;
		code: string;
		email?: string;
		city?: string;
		streetName?: string;
		streetNumber?: number;
		streetSuffix?: string;
		phone_number?: string;
		phone_number_2?: string;
	};
}

interface OrderEvent extends RegisterOrder {
	createdBy: string;
	createdAt: number;
	name: string;
	description?: string;
}

interface RegisterCountry {
	lat: number;
	lng: number;
}

interface Country extends RegisterCountry {
	name: string;
}
