import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GET_ORGANISATIONS, GET_ORGANISATION_BY_ID, GET_USER_ORGANISATIONS_BY_USER_ID } from "../../graphql/queries";
import { asyncStorageAdapter } from "../../lib/asyncStorageAdapter";
import { client } from "../../lib/client";
import { useUserStore } from "./userStore";

// We use GraphQL for gathering information about Organisations
// For mutations we need to use Firebase Realtime Database directly
// The reason is that Firebase is object-oriented and doesn't fit well with GraphQL queries/mutations
// Therefore we need to flatten the query result to match the structure of the type Organisation

type OrganisationInit = {
	name: string;
	value: {
		name: string;
		address: string;
		settings: {
			country: string;
			lat: number;
			lng: number;
			order: {
				categories: string[];
			};
		};
	};
};

type OrganisationStore = {
	organisations: Organisation[];
	selectedOrganisation: Organisation | null;
	setOrganisations: (Organisations: Organisation[]) => void;
	setSelectedOrganisation: (organisation: Organisation) => void;
	initOrganisations: () => Promise<boolean>;
	initSelectedOrganisation: () => Promise<boolean>;
	error?: null | {
		message?: string;
		details?: string;
	};
	resetError: () => void;
};

export const useOrganisationStore = create<OrganisationStore>()(
	persist(
		(set, get) => ({
			organisations: [] as Organisation[],
			selectedOrganisation: null,
			setOrganisations: (organisations) => set(() => ({ organisations })),
			setSelectedOrganisation: (organisation) => set(() => ({ selectedOrganisation: organisation })),
			initOrganisations: async () => {
				try {
					const { selectedUser } = useUserStore.getState();

					if (!selectedUser) return false;

					if (selectedUser.isAdmin) {
						const { data } = await client.query({
							query: GET_ORGANISATIONS,
						});

						set({
							organisations:
								data.getOrganisations.map((org: OrganisationInit) => {
									return {
										id: org.name,
										...org.value,
									};
								}) || [],
						});
						return true;
					} else {
						const { data } = await client.query({
							query: GET_USER_ORGANISATIONS_BY_USER_ID,
						});

						set({
							organisations:
								data.getUserOrganisationsByUserId.map((x: any) => x.value.organisation) || [],
						});

						return true;
					}
				} catch (error: unknown) {
					console.log(error);
					return false;
				}
			},
			initSelectedOrganisation: async () => {
				try {
					const { selectedUser } = useUserStore.getState();

					if (!selectedUser) return false;

					const { data } = await client.query({
						query: GET_ORGANISATION_BY_ID,
						variables: { id: selectedUser.selectedOrganisationId },
					});

					set({
						selectedOrganisation: { id: selectedUser.selectedOrganisationId, ...data.getOrganisationById },
					});

					return true;
				} catch (error: unknown) {
					console.log(error);
					return false;
				}
			},
			error: null,
			resetError: () => set({ error: null }),
		}),
		{
			name: "organisation-storage",
			storage: asyncStorageAdapter,
		}
	)
);
