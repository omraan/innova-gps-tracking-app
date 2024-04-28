import AsyncStorage from "@react-native-async-storage/async-storage";
import { set as dbSet, push, ref, remove, update } from "firebase/database";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { db } from "../../firebase";
import { GET_USERS } from "../../graphql/queries";
import { asyncStorageAdapter } from "../../lib/asyncStorageAdapter"; // adjust the path as needed
import { client } from "../../lib/client";

type UserInit = {
	name: string;
	value: {
		name: string;
		email: string;
		isAdmin: boolean;
		status?: string;
		selectedOrganisationId?: string;
	};
};

type UserStore = {
	users: User[];
	selectedUser: User | null;
	setUsers: (users: User[]) => void;
	setSelectedUser: (user: User) => void;
	initUsers: () => Promise<boolean>;
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
					const { data } = await client.query({ query: GET_USERS });
					const users: UserInit[] = data.getUsers;

					// Here we flatten the Users object to single list per User.
					const result = users.map((user) => {
						return {
							id: user.name,
							...user.value,
						};
					});
					set({ users: result || [] });
					return true;
				} catch (error: unknown) {
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
