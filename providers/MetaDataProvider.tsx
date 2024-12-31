import { GET_VEHICLES } from "@/graphql/queries";
import { useVehicleStore } from "@/hooks/useVehicleStore";
import { getOptimizedTrip } from "@/services/optimized-trips";
import { useQuery } from "@apollo/client";
import { useAuth, useOrganization, useUser } from "@clerk/clerk-expo";
import polyline from "@mapbox/polyline";
import { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position";
import * as Location from "expo-location";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { LatLng } from "react-native-maps";
import { useOrder } from "./OrderProvider";

const MetaDataContext = createContext<{
	orgRole: string | undefined;
	statusCategories: StatusCategory[] | null;
} | null>(null);
declare global {
	interface UserUnsafeMetadata {
		defaultMapView?: string;
		organizations: {
			[key: string]: {
				vehicleId?: string;
				labels?: string[];
			};
		};
	}
	interface UserPublicMetadata {
		organizations: {
			[key: string]: {
				orgRole?: string;
				vehicleId?: string;
			};
		};
	}
}
export const MetaDataProvider = ({ children }: PropsWithChildren) => {
	const [orgRole, setOrgRole] = useState<string | undefined>();

	const { orgId, orgRole: authRole } = useAuth();
	const { user } = useUser();

	const { organization } = useOrganization();
	const [statusCategories, setStatusCategories] = useState<StatusCategory[] | null>(null);

	const { selectedVehicle, setSelectedVehicle } = useVehicleStore();
	const { data: dataVehicles } = useQuery(GET_VEHICLES);
	const vehicles = dataVehicles?.getVehicles || [];

	useEffect(() => {
		const metaData = user?.unsafeMetadata as UserPublicMetadata;
		if (!orgId || !metaData || !metaData.organizations[orgId]) return;

		const orgData = metaData.organizations[orgId];
		if (authRole === "org:admin") {
			setOrgRole("org:admin");
		} else {
			if (orgData.orgRole) {
				setOrgRole(orgData.orgRole);
			}
		}
		if (orgData.vehicleId && !selectedVehicle && vehicles && vehicles.length > 0) {
			const newSelectedVehicle = vehicles.find(
				(v: { name: string; value: Vehicle }) => v.name === orgData.vehicleId
			);
			if (newSelectedVehicle) {
				setSelectedVehicle(newSelectedVehicle);
			}
		}
		setStatusCategories(
			organization?.publicMetadata.statusCategories || [
				{
					color: "#000000",
					name: "Unknown",
				},
			]
		);
	}, [user?.publicMetadata, orgId]);

	return <MetaDataContext.Provider value={{ orgRole, statusCategories }}>{children}</MetaDataContext.Provider>;
};

export const useMetadata = () => {
	const context = useContext(MetaDataContext);
	if (!context) {
		throw new Error("useRoute must be used within a RouteProvider");
	}
	return context;
};
