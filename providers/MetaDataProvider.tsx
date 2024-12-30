import { getOptimizedTrip } from "@/services/optimized-trips";
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

export const MetaDataProvider = ({ children }: PropsWithChildren) => {
	const [orgRole, setOrgRole] = useState<string | undefined>();

	const { isSignedIn, getToken, orgId, userId, orgRole: authRole } = useAuth();
	const { user } = useUser();

	const { organization } = useOrganization();
	const [statusCategories, setStatusCategories] = useState<StatusCategory[] | null>(null);
	useEffect(() => {
		const metaDataLabels = user?.publicMetadata as UserPublicMetadata;
		if (authRole === "org:admin") {
			setOrgRole("org:admin");
		} else {
			if (
				orgId &&
				metaDataLabels &&
				metaDataLabels.organizations &&
				metaDataLabels.organizations[orgId]?.orgRole
			) {
				setOrgRole(metaDataLabels.organizations[orgId].orgRole);
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
