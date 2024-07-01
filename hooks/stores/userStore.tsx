import AsyncStorage from "@react-native-async-storage/async-storage";
import { set as dbSet, push, ref, remove, update } from "firebase/database";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { auth, db } from "../../firebase";
import { GET_USERS, GET_USER_BY_ID, GET_USER_ORGANISATIONS_BY_ORGANISATION_ID } from "../../graphql/queries";
import { asyncStorageAdapter } from "../../lib/asyncStorageAdapter"; // adjust the path as needed
import { client } from "../../lib/client";

type UserStore = {
	users: User[];
	selectedUser: User | null;
	setUsers: (users: User[]) => void;
	setSelectedUser: (user: User) => void;
	initUsers: () => Promise<boolean>;
	initSelectedUser: () => Promise<boolean>;
	updateUser: (user: Partial<User>) => Promise<boolean>;
	error?: null | {
		message?: string;
		details?: string;
	};
	resetError: () => void;
};

export const useUserStore = create<UserStore>()(
	persist(
		(set, get) => ({
			users: [] as User[],
			selectedUser: null,
			setUsers: (users) => set(() => ({ users })),
			setSelectedUser: (user) => set(() => ({ selectedUser: user })),
			initUsers: async () => {
				try {
					const { selectedUser } = useUserStore.getState();

					if (!selectedUser) return false;

					const { data } = await client.query({
						query: GET_USER_ORGANISATIONS_BY_ORGANISATION_ID,
						variables: { organisationId: selectedUser.selectedOrganisationId },
					});

					set({
						users: data.getUserOrganisationsByOrganisationId.map((x: any) => x.value.user) || [],
					});
					return true;
				} catch (error: unknown) {
					console.log(error);
					set({
						users: [],
						error: {
							message: "Failed to fetch Users from the server.",
							details: error instanceof Error ? error.message : "",
						},
					});
					return false;
				}
			},
			initSelectedUser: async () => {
				try {
					const user = auth.currentUser;

					if (!user) {
						throw new Error("You are not logged in");
					}
					const { data } = await client.query({
						query: GET_USER_BY_ID,
						variables: { id: user.uid },
					});

					set({
						selectedUser: {
							...data.getUserById,
							id: user.uid,
						},
					});
					return true;
				} catch (error: unknown) {
					console.log(error);
					set({
						users: [],
						error: {
							message: "Failed to fetch Users from the server.",
							details: error instanceof Error ? error.message : "",
						},
					});
					return false;
				}
			},
			updateUser: async (formData) => {
				try {
					const state = get();

					// Trying to get a User by id.
					const existingUser = state.users.find((user: User) => user.id === formData.id);

					// If not, throw an error.
					if (!existingUser) {
						throw new Error("User not found.");
					}

					// Destructure the id from the formData so we can update firebase realtime database
					const { id, ...formDataWithoutId } = formData;

					// Update User in the firebase realtime database
					const userRef = ref(db, "users/" + id);
					update(userRef, formDataWithoutId);

					// Update User in the state
					set((state: { users: User[] }) => ({
						users: state.users.map((user: User) =>
							user.id === formData.id ? { ...user, ...formData } : user
						),
					}));

					return true;
				} catch (error: unknown) {
					set({
						error: {
							message: "Failed to add User to the server.",
							details: error instanceof Error ? error.message : "",
						},
					});
					return false;
				}
			},
			error: null,
			resetError: () => set({ error: null }),
		}),
		{
			name: "user-storage",
			storage: asyncStorageAdapter,
		}
	)
);
