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
		defaultServiceTime: string;
		defaultStartTime: string;
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
	createdBy: string;
	createdAt: number;
	driverId?: string;
	vehicleId?: string;
	customerId?: string;
	expectedDeliveryDate?: string;
	status?: string;
	category?: string;
	orderNumber?: string;
	notes?: string;
}

interface RegisterDispatch {
	routeId?: string;
	customerId?: string;
	expectedDeliveryDate?: string;
	estimatedTimeArrival?: string;
	trackAndTraceCode: string;
	status: string;
	category?: string;
	orderNumbers?: string;
	orders?: {
		orderId: string | null;
		orderNumber?: string;
	}[];
	notes?: string;
}

interface Dispatch extends RegisterDispatch {
	id: string;
	createdBy: string;
	createdAt: number;
	events?: DispatchEvent[];
	modifiedAt?: number;
	modifiedBy?: string;
}
interface DispatchRoute extends Dispatch {
	index?: number;
	distance?: number;
	duration?: number;
	estimatedTimeArrival?: string;
	steps: Step[];
}
interface DispatchExtended extends Dispatch {
	customer: RegisterCustomer;
	amountDispatches?: number;
	route: DispatchRoute;
}

interface Order extends RegisterOrder {
	id: string;
	events?: OrderEvent[];
}
interface OrderExtended extends Order {
	customer: RegisterCustomer;
}

interface OrderEvent extends RegisterOrder {
	name: string;
	description?: string;
	createdAt?: number;
	modifiedAt?: number;
	modifiedBy?: string;
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
	active?: boolean;
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

interface Route {
	title: string;
	vehicleId: string;
	driverId: string;
	startTime?: string;
	endTime?: string;
	expectedStartTime: string;
	expectedEndTime?: string;
	geometry?: string;
	active?: boolean;
}
interface RegisterRoute extends Route {
	date: string;
}

type RouteOptions = "existing" | "new" | "open";

interface TrackingLocation {
	latitude: number;
	longitude: number;
	speed: number;
	speedInKmh: number;
	timestamp: number;
}

interface Step {
	name: string;
	duration: number;
	distance: number;
	driving_side: string;
	weight: number;
	mode: string;
	maneuver: {
		type: string;
		instruction: string;
		bearing_before: number;
		bearing_after: number;
		location: [number, number];
	};
	geometry: {
		type: string;
		coordinates: [number, number][];
	};
}

type NavigateOptionName = "navigate" | "locate-dispatch" | "locate-user" | "locate-route";

type NavigationOption = {
	name: NavigateOptionName;
	iconName: string;
	iconObject: string | Icon;
	iconSize: number;
	className?: string;
};
