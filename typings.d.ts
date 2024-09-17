declare global {
	interface OrganizationPublicMetadata {
		address: string;
		statusCategories: {
			name: string;
			color: string;
		}[];
		orderCategories: {
			name: string;
			color: string;
		}[];

		country: string;
		lat: number;
		lng: number;
	}
}

interface RegisterCustomer {
	name: string;
	email?: string;
	lat: number;
	lng: number;
	code: string;
	city?: string;
	streetName?: string;
	streetNumber?: string;
	phoneNumber?: string;
	phoneNumber2?: string;
	phoneNumber3?: string;
	notes?: string;
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
	expectedDeliveryDate?: string;
	status: string;
	orderNumber?: string;
	notes?: string;
	category?: string;
	routeIndex?: number;
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
		phoneNumber?: string;
		phoneNumber2?: string;
		phoneNumber3?: string;
		notes?: string;
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

interface GeoLocation {
	latitude: number;
	longitude: number;
}

interface LiveLocation extends GeoLocation {
	speed: number | null;
	speedInKmh: number;
	timestamp: string;
}
