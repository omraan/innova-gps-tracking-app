import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GET_ORGANISATIONS } from "../../graphql/queries";
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
					const { data } = await client.query({ query: GET_ORGANISATIONS });
					const organisations: OrganisationInit[] = data.getOrganisations;

					// Here we flatten the Organisations object to single list per Organisation.
					const result = organisations.map((org) => {
						return {
							id: org.name,
							...org.value,
						};
					});
					set({ organisations: result || [] });
					return true;
				} catch (error: unknown) {
					return false;
				}
			},
			initSelectedOrganisation: async () => {
				try {
					const { selectedUser } = useUserStore.getState();
					if (selectedUser?.selectedOrganisationId) {
						const { data } = await client.query({ query: GET_ORGANISATIONS });
						const organisations: OrganisationInit[] = data.getOrganisations;

						// Here we flatten the Organisations object to single list per Organisation.
						const result = organisations.map((org) => {
							return {
								id: org.name,
								...org.value,
							};
						});

						set({
							selectedOrganisation: result.find(
								(organisation) => organisation.id === selectedUser.selectedOrganisationId
							),
						});
					}
					return true;
				} catch (error: unknown) {
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
