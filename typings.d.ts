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
	firstName?: string;
	lastName?: string;
	companyName?: string;
	email?: string;
	code: string;
	phoneNumbers?: {
		type: PhoneType;
		countryCode: string;
		number: string;
	}[];
	notes?: string;
	type: CustomerType;
	locationIds: string[];
	defaultLocationId?: string;
	locations?: RegisterLocation[];
}
enum CustomerType {
	COMMERCIAL = "COMMERCIAL",
	PRIVATE = "PRIVATE",
}
interface Customer extends RegisterCustomer {
	id: string;
	defaultLocation: Location;
}
interface RegisterBreak {
	duration: string;
	earliestStartTime: string;
	latestEndTime: string;
}
interface Break extends RegisterBreak {
	index: number;
}
interface RegisterVehicle {
	title: string;
	licensePlate: string;
	earliestStartTime?: string | null;
	latestEndTime?: string | null;
	capacity?: {
		volume?: number | null;
		weight?: number | null;
		units?: number | null;
	} | null;
	type?: string;
	breaks: RegisterBreak[];
	defaultDriverId?: string | null;
	type: string;
}

interface Vehicle extends RegisterVehicle {
	id: string;
}

interface RegisterDispatch {
	routeId?: string;
	customerId?: string;
	locationId?: string;
	plannedDeliveryDate?: string;
	trackAndTraceCode: string;
	status?: string;
	category?: string;
	orders?: {
		orderNumber?: string;
	}[];
	notes?: string;
	requirements?: {
		vehicleType?: string;
		capacity?: {
			volume?: number;
			weight?: number;
			units?: number;
		};
	};
}
interface Dispatch extends RegisterDispatch {
	id: string;
	createdBy: string;
	createdAt: number;
	events?: DispatchEvent[];
	orders: {
		orderNumber?: string;
	}[];
}

interface DispatchExtended extends Dispatch {
	customer: Customer;
	amountDispatches?: number;
	route: {
		id?: string;
		distance?: number;
		duration?: number;
		estimatedTimeArrival?: string;
		index?: number;
	};
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
	heading: number;
}

interface RouteMetrics {
	duration?: number;
	distance?: number;
	timeStart: string;
	timeEnd?: string | null;
	geometry?: string;
}
interface RouteMetricsActual extends RouteMetrics {
	active?: boolean;
}
interface RegisterRoute {
	title: string;
	date: string;
	vehicleId: string;
	driverId: string;
	estimation: RouteMetrics;
	vehicleType: string;
	geometry?: string;
	stops: RegisterRouteStop[];
	createdBy?: string;
	createdAt?: number;
	modifiedBy?: string;
	modifiedAt?: number;
}
interface Route extends RegisterRoute {
	id: string;
	actual: RouteMetricsActual;
	stops: { name: string; value: RouteStop }[];
	vehicle?: Vehicle;
	coordinates?: [number, number][];
	createdBy: string;
	createdAt: number;
	modifiedBy: string;
	modifiedAt: number;
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
	intersections: {
		bearings: [number];
		entry: [boolean];
		is_urban: boolean;
		admin_index: number;
		out: number;
		geometry_index: number;
		location: [number, number];
	}[];
	maneuver: {
		type: string;
		instruction: string;
		modifier: string;
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

interface RegisterLocation {
	title: string;
	streetName: string;
	streetNumber: string;
	city: string;
	postalCode?: string;
	country?: string;
	latitude: number;
	longitude: number;
	notes?: string;
	isDefault?: boolean;
	type: LocationType;
	customerId?: string;
	openingHours?: OpeningHours;
	serviceTime?: string;
}

interface TimeSlot {
	startTime: string; // Format: "HH:mm"
	endTime: string; // Format: "HH:mm"
}

interface DaySchedule {
	isOpen: boolean;
	timeSlots: TimeSlot[];
}

interface OpeningHours {
	monday: DaySchedule;
	tuesday: DaySchedule;
	wednesday: DaySchedule;
	thursday: DaySchedule;
	friday: DaySchedule;
	saturday: DaySchedule;
	sunday: DaySchedule;
}

interface Location extends RegisterLocation {
	id: string;
	createdBy: string;
	createdAt: number;
	modifiedBy?: string;
	modifiedAt?: number;
}

interface Phone {
	type: "MOBILE" | "LANDLINE";
	countryCode: string;
	number: string;
}
interface BulkCustomer {
	id?: string;
	firstName?: string;
	lastName?: string;
	companyName?: string;
	code: string;
	email?: string;
	phoneNumbers?: Phone[];
	type: "COMMERCIAL" | "PRIVATE";
	locations: {
		id?: string;
		streetName: string;
		streetNumber: string;
		city: string;
		postalCode?: string;
		country?: string;
		latitude?: number;
		longitude?: number;
	}[];
}

interface RegisterRouteStop {
	id?: string;
	locationId: string;
	routeId?: string;
	dispatchId?: string;
	transitPointId?: string;
	stopType: RouteStopType;
	dispatch?: RegisterDispatch;
	transitPoint?: TransitPoint;
	dependsOn?: string;
	sequence?: number;
	status: string;
}

interface RouteStop extends RegisterRouteStop {
	id: string;
	sequence: number;
	route: Route;
	dispatch?: DispatchExtended;
	location: Location;
	estimation?: RouteStopMetrics;
	actual?: RouteStopMetrics;
	createdBy?: string;
	createdAt?: number;
	modifiedBy?: string;
	modifiedAt?: number;
	type: RouteStopType;
	displayName: string;
}

interface RouteStopMetrics {
	duration?: number;
	distance?: number;
	timeDeparture?: string;
	timeArrival?: string;
	serviceTime?: string;
}
