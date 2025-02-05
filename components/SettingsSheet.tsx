import { MapViewOptions } from "@/constants/MapViewOptions";
import { UPDATE_ROUTE_END_TIME, UPDATE_ROUTE_START_TIME } from "@/graphql/mutations";
import { GET_VEHICLES } from "@/graphql/queries";
import { useSelectionStore } from "@/hooks/useSelectionStore";
import toastPromise from "@/lib/toastPromise";
import { useDispatch } from "@/providers/DispatchProvider";
import { useRoute } from "@/providers/RouteProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { useMutation, useQuery } from "@apollo/client";
import { useUser } from "@clerk/clerk-expo";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import moment from "moment";
import { useEffect } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker from "./DateTimePicker";
import { ModalPicker } from "./ModalPicker";

export default function SettingsSheet() {
	const { bottomSheetRefs, handlePanDownToClose } = useSheetContext();

	const { user } = useUser();
	const { refetchRoutes, routes } = useRoute();
	const { refetchDispatches } = useDispatch();
	const { setActiveSheet } = useSheetContext();
	const { selectedRoute, setSelectedRoute, selectedVehicle, setSelectedVehicle, selectedDate, setSelectedDate } =
		useSelectionStore();

	const { data: dataVehicles, refetch: refetchVehicles } = useQuery(GET_VEHICLES, { fetchPolicy: "network-only" });
	const vehicles: { name: string; value: Vehicle }[] = dataVehicles?.getVehicles || [];

	const onDateChange = (newDate: any) => {
		const currentDate = newDate;
		setSelectedDate(moment(currentDate).format("yyyy-MM-DD"));
	};

	const handlePickerChange = (value: string) => {
		setSelectedVehicle(vehicles.find((v) => v.name === value) || null);
	};

	const handleRefresh = async () => {
		let promises;
		if (selectedRoute?.name) {
			promises = Promise.all([refetchRoutes(), refetchDispatches(), refetchVehicles()]);
		} else {
			promises = Promise.all([refetchRoutes(), refetchVehicles()]);
		}

		toastPromise(promises, {
			loading: "Refreshing data...",
			success: "Data refreshed",
			error: "Failed to refresh data",
		});
	};
	const [UpdateRouteEndTime] = useMutation(UPDATE_ROUTE_END_TIME);

	const endRoute = async () => {
		const endTime = moment(new Date()).format("yyyy-MM-DD HH:mm:ss");

		if (!selectedDate) {
			return;
		}
		if (!selectedRoute) {
			return;
		}

		const variables = {
			date: selectedDate,
			id: selectedRoute?.name,
			endTime,
		};
		await UpdateRouteEndTime({
			variables,
			onCompleted: (data) => {
				setSelectedRoute({
					name: selectedRoute.name,
					value: {
						...selectedRoute.value,
						endTime,
						active: false,
					},
				});
			},
			onError: (error) => {
				console.error("Failed to end route", error);
			},
		});
	};

	const [UpdateRouteStartTime] = useMutation(UPDATE_ROUTE_START_TIME);

	const startRoute = async () => {
		const startTime = moment(new Date()).format("yyyy-MM-DD HH:mm:ss");
		if (!selectedDate) {
			return;
		}
		if (!selectedRoute) {
			return;
		}
		const variables = {
			date: selectedDate,
			id: selectedRoute?.name,
			startTime,
		};
		if (selectedRoute?.value.startTime) {
			setSelectedRoute({
				name: selectedRoute.name,
				value: {
					...selectedRoute.value,
					active: true,
				},
			});
			setActiveSheet("currentDispatch");
		} else {
			await UpdateRouteStartTime({
				variables,
				onCompleted: () => {
					setSelectedRoute({
						name: selectedRoute.name,
						value: {
							...selectedRoute.value,
							startTime,
							active: true,
						},
					});
					setActiveSheet("currentDispatch");
				},
				onError: (data) => {
					console.log("onError", data);
				},
			});
		}
	};
	const filteredRoutes = routes.filter((route) => route.value.vehicleId === selectedVehicle?.name);

	useEffect(() => {
		if (!selectedRoute && routes && filteredRoutes.length === 1) {
			setSelectedRoute(filteredRoutes[0]);
		}
	}, [routes]);

	return (
		<BottomSheet
			ref={bottomSheetRefs.settings}
			index={-1}
			enablePanDownToClose
			enableDynamicSizing={true}
			backgroundStyle={{ backgroundColor: "#f9f9f9" }}
			onChange={(index) => {
				if (index === -1) {
					handlePanDownToClose("settings");
					if (selectedRoute?.value.active) {
						setActiveSheet("currentDispatch");
					}
				}
			}}
		>
			<BottomSheetView className="px-8 py-3">
				<View className="mb-8 flex-row gap-5">
					<Pressable onPress={handleRefresh} className="flex-1">
						<View className="px-5 bg-gray-200 border border-gray-300 text-gray-700 font-semibold py-4 rounded">
							<Text className="text-gray-700  text-center font-semibold">Refresh data</Text>
						</View>
					</Pressable>
					{selectedRoute?.value.active ? (
						<TouchableOpacity onPress={endRoute} className="flex-1 bg-black py-4 rounded">
							<Text className="text-white font-bold text-center">End Route</Text>
						</TouchableOpacity>
					) : (
						<TouchableOpacity
							onPress={startRoute}
							className="flex-1 bg-black py-4 rounded"
							style={{ opacity: !selectedRoute ? 0.5 : 1 }}
							disabled={!selectedRoute}
						>
							<Text className="text-white font-bold text-center">Start Route</Text>
						</TouchableOpacity>
					)}
				</View>
				<View className="mb-2">
					<Text className="text-gray-500">Choose Date</Text>
					<DateTimePicker
						currentDate={moment(selectedDate).toDate()}
						onChange={onDateChange}
						disabled={selectedRoute?.value.active}
					/>
				</View>
				<View className="mb-2">
					{vehicles && vehicles.length > 0 && (
						<View className="">
							<Text className="text-gray-500">Choose vehicle</Text>
							<ModalPicker
								key={selectedVehicle?.name}
								list={vehicles.map((v: any) => {
									return {
										value: v.name,
										label: v.value.licensePlate,
									};
								})}
								options={{
									defaultValue: selectedVehicle?.name,
									displayAll: true,
									displayAllLabel: "All Vehicles",
								}}
								onSelect={handlePickerChange}
								disabled={selectedRoute?.value.active}
							/>
						</View>
					)}
				</View>

				<View className="mb-2">
					<Text className=" text-gray-500">Select a route to start</Text>
					<ModalPicker
						key={selectedRoute?.name}
						list={routes
							.filter((route) => {
								if (selectedVehicle?.name) {
									return route.value.vehicleId === selectedVehicle.name;
								}
								return true;
							})
							.map((route: any) => {
								return {
									value: route.name,
									label: route.value.title,
								};
							})}
						disabled={selectedRoute?.value.active}
						options={{
							defaultValue: selectedRoute?.name,
							emptyMessage: `No routes available this day${
								selectedVehicle && routes.length > 0
									? " for this vehicle. Please select another vehicle."
									: ""
							}.`,
						}}
						onSelect={(routeId) =>
							routeId &&
							routes.find((r) => r.name === routeId) &&
							setSelectedRoute(routes.find((r) => r.name === routeId)!)
						}
					/>
				</View>

				<View className="mb-10">
					<Text className="text-gray-500">Default Map View</Text>
					{user && (
						<ModalPicker
							key={user?.unsafeMetadata.defaultMapView as string}
							list={MapViewOptions}
							options={{
								defaultValue: user.unsafeMetadata.defaultMapView as string,
								displayAll: false,
							}}
							onSelect={(value) =>
								user.update({
									unsafeMetadata: {
										...user.unsafeMetadata,
										defaultMapView: value,
									},
								})
							}
						/>
					)}
				</View>
			</BottomSheetView>
		</BottomSheet>
	);
}
