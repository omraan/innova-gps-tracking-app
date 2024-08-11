interface RegisterCustomer {
	name: string;
	email?: string;
	lat: number;
	lng: number;
	code: string;
	city?: string;
	streetName?: string;
	streetNumber?: string;
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
	orderNumber?: string;
	notes?: string;
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
		streetNumber?: string;
		phone_number?: string;
		phone_number_2?: string;
	};
}
interface CustomerOrders extends OrderExtended {
	amountOrders: number;
	orderIds: string[];
	orderNumbers: number[];
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
type StatusCategory = {
	color: string;
	name: string;
};

type MapTypes = "standard" | "hybrid";
