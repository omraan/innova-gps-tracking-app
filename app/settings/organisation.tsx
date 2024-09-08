import LoadingScreen from "@/components/LoadingScreen";
import { ModalPicker } from "@/components/ModalPicker";
import { GET_VEHICLES } from "@/graphql/queries";
import { useVehicleStore } from "@/hooks/useVehicleStore";
import { useQuery } from "@apollo/client";
import { useAuth, useOrganizationList, useUser } from "@clerk/clerk-expo";
import { useNavigation } from "expo-router";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import { useTailwind } from "tailwind-rn";

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
			};
		};
	}
}

function Organisation() {
	const tw = useTailwind();
	const navigation = useNavigation();
	const { userMemberships, setActive, isLoaded } = useOrganizationList({
		userMemberships: true,
		revalidate: true,
	});

	const { data: dataVehicles } = useQuery(GET_VEHICLES);
	// console.log(dataVehicles);
	const vehicles = dataVehicles?.getVehicles || [];

	const organizations: any = userMemberships.data || [];

	const { orgId } = useAuth();
	const { user } = useUser();
	const { selectedVehicle, setSelectedVehicle } = useVehicleStore();
	const [labels, setLabels] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [initialLoading, setInitialLoading] = useState(true);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: "Organisation",
		});
	}, [navigation]);

	useEffect(() => {
		if (userMemberships && userMemberships.data) {
			userMemberships.revalidate();
		}
	}, []);

	if (!isLoaded) {
		return (
			<SafeAreaView style={tw("h-full bg-white flex items-center justify-center")}>
				<Text style={tw("text-center text-gray-500")}>Loading...</Text>
			</SafeAreaView>
		);
	}

	useEffect(() => {
		setLabels([]);
		setSelectedVehicle(undefined);
	}, [orgId]);

	useEffect(() => {
		const metaDataLabels = user?.unsafeMetadata as UserUnsafeMetadata;
		if (orgId && metaDataLabels && metaDataLabels.organizations && metaDataLabels.organizations[orgId]?.labels) {
			setLabels(metaDataLabels.organizations[orgId].labels);
		}
	}, [user?.unsafeMetadata, orgId]);

	const labelOptions = [
		{
			value: "customer.name",
			label: "Name",
		},
		{
			value: "customer.streetName",
			label: "Street Name",
		},
		{
			value: "customer.streetNumber",
			label: "Street Number",
		},
		{
			value: "city",
			label: "City",
		},
		{
			value: "orderNumbers",
			label: "Order Number(s)",
		},
	];

	useEffect(() => {
		if (vehicles && vehicles.length > 0 && orgId && user && user.unsafeMetadata.organizations) {
			const metaData = user.unsafeMetadata.organizations[orgId];
			if (!selectedVehicle && metaData?.vehicleId) {
				const vehicle = vehicles.find(
					(vehicle: { name: string; value: Vehicle }) => vehicle.name === metaData.vehicleId
				);
				if (vehicle) {
					setSelectedVehicle(vehicle);
				}
			}
		}
	}, [vehicles]);

	useEffect(() => {
		if (selectedVehicle && user && orgId && user.publicMetadata.organizations) {
			user.update({
				unsafeMetadata: {
					...user.unsafeMetadata,
					organizations: {
						...user.unsafeMetadata.organizations,
						[orgId]: {
							...user.publicMetadata.organizations[orgId!],
							vehicleId: selectedVehicle.name,
						},
					},
				},
			});
		}
	}, [selectedVehicle]);

	const handleAddLabel = (value: string) => {
		let newLabels;
		if (user && user.unsafeMetadata.organizations && orgId) {
			const metaData = user.unsafeMetadata.organizations[orgId];
			if (metaData) {
				if (!metaData.labels?.includes(value)) {
					newLabels = metaData?.labels ? [...metaData.labels, value] : [value];
				}
			} else {
				newLabels = [value];
			}
		} else {
			newLabels = [value];
		}
		if (newLabels && user && orgId) {
			user.update({
				unsafeMetadata: {
					...user.unsafeMetadata,
					organizations: {
						...user.unsafeMetadata.organizations,
						[orgId]: {
							...user.unsafeMetadata.organizations[orgId],
							labels: newLabels,
						},
					},
				},
			});
			setLabels(newLabels);
		}
	};

	const handleRemoveLabel = (value: string) => {
		return () => {
			const newLabels = labels.filter((l) => l !== value);
			if (user) {
				user.update({
					unsafeMetadata: {
						...user.unsafeMetadata,
						organizations: {
							...user.unsafeMetadata.organizations,
							[orgId as string]: {
								...user.unsafeMetadata.organizations[orgId!],
								labels: newLabels,
							},
						},
					},
				});
			}

			setLabels(newLabels);
		};
	};

	const handleDragEnd = ({ data }: { data: string[] }) => {
		user?.update({
			unsafeMetadata: {
				...user.unsafeMetadata,
				organizations: {
					...user.unsafeMetadata.organizations,
					[orgId!]: {
						...user.unsafeMetadata.organizations[orgId!],
						labels: data,
					},
				},
			},
		});
		setLabels(data);
	};

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaView style={tw("h-full bg-white")}>
				<LoadingScreen loading={loading} />

				<View style={tw("p-5")}>
					<Text style={tw("mb-2 text-gray-600")}>Selected Organization</Text>
					{organizations && organizations.length > 0 && (
						<ModalPicker
							list={organizations.map((mem: any) => {
								return {
									value: mem.organization.id,
									label: mem.organization.name,
								};
							})}
							options={{
								defaultValue: orgId!,
							}}
							onSelect={(value) => {
								setLoading(true);
								setActive({ organization: value });
								const timer = setTimeout(() => {
									setLoading(false);
								}, 5000);

								return () => clearTimeout(timer);
							}}
						/>
					)}
				</View>
				<View style={tw("p-5")}>
					<Text style={tw("mb-2 text-gray-600")}>Selected Vehicle</Text>
					{vehicles && (
						<ModalPicker
							key={selectedVehicle?.name}
							list={
								vehicles.map((vehicle: { name: string; value: Vehicle }) => {
									return {
										value: vehicle.value.licensePlate,
										label: vehicle.value.name,
									};
								}) || []
							}
							options={{
								defaultValue: selectedVehicle?.value.licensePlate || undefined,
							}}
							onSelect={(value) =>
								setSelectedVehicle(
									vehicles.find(
										(vehicle: { name: string; value: Vehicle }) =>
											vehicle.value.licensePlate === value
									)
								)
							}
						/>
					)}
				</View>
				<View style={tw("p-5")}>
					<Text style={tw("mb-2 text-gray-600")}>Label</Text>
					<ModalPicker
						key={user?.publicMetadata.defaultMapView as string}
						list={labelOptions}
						onSelect={handleAddLabel}
					/>
					<View style={tw("flex flex-row flex-wrap mt-5 py-3")}>
						<DraggableFlatList
							key={orgId}
							data={labels}
							renderItem={({ item, drag, getIndex }) => (
								<View style={tw("flex-row items-center")}>
									<View
										style={tw(
											"border-2 border-gray-200 rounded-full h-8 w-8 flex-row items-center justify-center mr-5"
										)}
									>
										<Text style={tw("text-gray-400")}>{getIndex()! + 1}</Text>
									</View>
									<Pressable
										onLongPress={drag}
										style={tw(
											"bg-gray-100 border border-gray-200 pl-4 pr-2 py-2 mr-2 my-2 rounded flex-row justify-between items-center"
										)}
									>
										<Text style={tw("mr-5 text-gray-700 font-semibold")}>
											{labelOptions.find((l) => l.value === item)?.label}
										</Text>
										<Pressable onPress={handleRemoveLabel(item)}>
											<View style={tw("px-2")}>
												<FontAwesomeIcon name="close" size={16} color="#999999" />
											</View>
										</Pressable>
									</Pressable>
								</View>
							)}
							keyExtractor={(item) => item}
							onDragEnd={handleDragEnd}
						/>
					</View>
				</View>
			</SafeAreaView>
		</GestureHandlerRootView>
	);
}

export default Organisation;
