import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { Camera, CameraView } from "expo-camera";
import { push, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTailwind } from "tailwind-rn";
import { db } from "../firebase";
import { useCustomerStore } from "../hooks/stores/customerStore";
import { useOrderStore } from "../hooks/stores/orderStore";
import { useUserStore } from "../hooks/stores/userStore";

const OrderCreateScreen = () => {
	const tw = useTailwind();
	const [hasPermission, setHasPermission] = useState<any>(null);
	const navigation = useNavigation();
	const [scanned, setScanned] = useState(false);

	const { selectedUser } = useUserStore();
	const [loading, setLoading] = useState(true);
	const { customers } = useCustomerStore();

	const { orders, setOrders } = useOrderStore();

	const [date, setDate] = useState(new Date());
	const [showPicker, setShowPicker] = useState(false);

	const onChange = (event: any, selectedDate: any) => {
		const currentDate = selectedDate || date;
		setShowPicker(false);
		setDate(currentDate);
	};
	useEffect(() => {
		navigation.setOptions({
			headerTitle: "Create Order",
			headerTitleStyle: { color: "Black" },
			headerBackTitle: "Deliveries",
			headerTintColor: "pink",
		});

		(async () => {
			const { status } = await Camera.requestCameraPermissionsAsync();
			setHasPermission(status === "granted");
		})();
	}, []);

	useEffect(() => {
		if (customers.length > 0 && selectedUser?.selectedOrganisationId) {
			setLoading(false);
		}
	}, [customers, selectedUser]);

	const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
		if (scanned) return;
		setScanned(true);
		if (customers && customers.length > 0 && orders) {
			const selectedCustomer = customers.find((customer: Customer) => customer.code === data);
			if (!selectedCustomer || !selectedUser) return false;

			try {
				const newOrder = {
					expectedDeliveryDate: Number(date),
					vehicleId: "",
					customerId: selectedCustomer.id,
					driverId: "",
					status: "Open",
				};
				const newOrderRef = await push(ref(db, `orders`), newOrder);
				const newOrderEvent: OrderEvent = {
					createdBy: selectedUser.id,
					createdAt: Number(new Date()),
					name: "Initialized Order",
					...newOrder,
				};
				if (newOrderRef.key) {
					const newOrderEventRef = await push(
						ref(
							db,
							`organisations/${selectedUser!.selectedOrganisationId}/orders/${newOrderRef.key}/events`
						),
						newOrderEvent
					);
					if (newOrderEventRef.key) {
						setOrders([
							...orders,
							{
								...newOrder,
								id: newOrderRef.key,
								customer: selectedCustomer,
								status: "Open",
							},
						]);
						alert(`Order (${selectedCustomer.code}) has been created successfully`);
					}
				}
			} catch (error) {
				console.error("Error creating order and event:", error);
			}
		}

		setTimeout(() => {
			setScanned(false); // Set scanned state back to false after 3 seconds
		}, 3000);
	};
	if (hasPermission === null) {
		return <View />;
	}
	if (hasPermission === false) {
		return <Text>No access to camera</Text>;
	}

	return (
		<View style={tw("h-full w-full bg-white")}>
			<View style={tw("py-3 mx-auto")}>
				<Pressable onPress={() => setShowPicker(true)}>
					<Text style={tw("bg-white text-gray-500")}>{date.toDateString()}</Text>
				</Pressable>
				{showPicker && <RNDateTimePicker display="compact" value={date} mode="date" onChange={onChange} />}
			</View>
			<View style={styles.container}>
				{!loading && (
					<CameraView
						barcodeScannerSettings={{
							barcodeTypes: ["qr"],
						}}
						onBarcodeScanned={handleBarCodeScanned}
						style={StyleSheet.absoluteFillObject}
					/>
				)}
			</View>
		</View>
	);
};
const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: "column",
		justifyContent: "center",
	},
});

export default OrderCreateScreen;
