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

interface RegisterOrder {
	organisationId: string;
	driverId?: string;
	vehicleId?: string;
	customerId?: string;
	expectedDeliveryDate?: number;
	orderCategory: string;
	events?: OrderEvent[];
}

interface Order extends RegisterOrder {
	id: string;
}

interface RegisterOrderEvent {
	date: number;
	status: string;
	createdBy: string;
	name: string;
	description?: string;
	currentIndicator: string;
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
