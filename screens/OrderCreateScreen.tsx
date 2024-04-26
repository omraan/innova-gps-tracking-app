import { useQuery } from "@apollo/client";
import { useNavigation } from "@react-navigation/native";
import { BarCodeScanner } from "expo-barcode-scanner";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GET_CUSTOMERS } from "../graphql/queries";

const OrderCreateScreen = () => {
	const [hasPermission, setHasPermission] = useState<any>(null);
	const navigation = useNavigation();
	const [scanned, setScanned] = useState(false);

	const customers = useQuery(GET_CUSTOMERS);

	useEffect(() => {
		navigation.setOptions({
			headerTitle: "Create Order",
			headerTitleStyle: { color: "Black" },
			headerBackTitle: "Deliveries",
			headerTintColor: "pink",
		});

		(async () => {
			const { status } = await BarCodeScanner.requestPermissionsAsync();
			setHasPermission(status === "granted");
		})();
	}, []);

	if (hasPermission === null) {
		return <View />;
	}
	if (hasPermission === false) {
		return <Text>No access to camera</Text>;
	}

	const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
		if (scanned) return;
		setScanned(true);
		console.log(customers.data.getCustomers[0].value.code);
		// Now you can safely use customers.data
		// alert("Customers data is: " + customers.data.getCustomers);
		const selectedCustomer = customers.data.getCustomers.filter(
			(customer: Customer) => customer.value.code === data
		);
		if (selectedCustomer.length > 0) {
			alert(
				`Customer Found with code: ${selectedCustomer[0].value.code} and it's name is ${selectedCustomer[0].value.name}`
			);
		} else {
			alert("Invalid QR Code " + data);
		}

		setTimeout(() => {
			setScanned(false); // Set scanned state back to false after 3 seconds
		}, 3000);
	};

	return (
		<View style={styles.container}>
			{customers?.data.getCustomers && customers?.data.getCustomers.length > 0 && (
				<BarCodeScanner onBarCodeScanned={handleBarCodeScanned} style={StyleSheet.absoluteFillObject} />
			)}
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
