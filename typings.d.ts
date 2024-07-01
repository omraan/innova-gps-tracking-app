type Customer = {
	id: string;
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
};

type CustomerList = {
	name: ID;
	value: Customer;
};

type OrderList = {
	name: string;
	value: OrderExtended;
};

interface RegisterOrder {
	driverId?: string;
	vehicleId?: string;
	customerId?: string;
	expectedDeliveryDate: number;
	orderCategory: string;
	events?: OrderEvent[];
	status?: string;
}

interface Order extends RegisterOrder {
	id: string;
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

interface RegisterOrderEvent {
	date?: number;
	timestamp?: number;
	status: string;
	createdBy: string;
	name: string;
	currentIndicator?: string;
}
interface OrderEvent extends RegisterOrder {
	id: string;
}

type TrackingItem = {
	customer_id: ID;
	customer: Customer;
	items: Item[];
};

type Item = {
	item_id: ID;
	name: string;
	price: number;
	quantity: number;
};

type OrderResponse = {
	value: Order;
};

type CustomerResponse = {
	name: ID;
	value: Customer;
};
type RegisterUser = {
	name: string;
	email: string;
	isAdmin: boolean;
	status?: string;
	selectedOrganisationId?: string;
};

interface User extends RegisterUser {
	id: string;
}
interface RegisterVehicle {
	name: string;
	licensePlate: string;
}

interface Vehicle extends RegisterVehicle {
	id: string;
}

interface RegisterOrganisation {
	name: string;
	address: string;
	settings: {
		order: {
			categories: string[];
		};
		country: string;
		lat: number;
		lng: number;
	};
}

interface Organisation extends RegisterOrganisation {
	id: string;
}
