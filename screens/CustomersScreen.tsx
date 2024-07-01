import { useQuery } from "@apollo/client";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Input } from "@rneui/themed";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Alert, Dimensions, Linking, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useTailwind } from "tailwind-rn";
import CustomerCard from "../components/CustomerCard";
import { CustomerMap } from "../components/CustomerMap";
import { useCustomerStore } from "../hooks/stores/customerStore";
import { useUserStore } from "../hooks/stores/userStore";
import { RootStackParamList } from "../navigator/RootNavigator";
import { TabStackParamList } from "../navigator/TabNavigator";
export type CustomerScreenNavigationProp = CompositeNavigationProp<
	BottomTabNavigationProp<TabStackParamList, "Customers">,
	NativeStackNavigationProp<RootStackParamList>
>;

const CustomersScreen = () => {
	const tw = useTailwind();

	const navigation = useNavigation<CustomerScreenNavigationProp>();
	const [input, setInput] = useState<string>("");
	const { selectedUser } = useUserStore();
	const [loading, setLoading] = useState(true);
	const { customers, initCustomers } = useCustomerStore();

	const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: false,
		});
	}, []);
	useEffect(() => {
		if (customers.length > 0 && selectedUser?.selectedOrganisationId) {
			console.log(customers);
			setLoading(false);
		}
	}, [customers, selectedUser]);

	return (
		<LinearGradient
			style={tw("h-full")}
			colors={["rgba(99, 102, 241, 1)", "rgba(99, 102, 241, 0.4)"]}
			start={[0, 0]}
			end={[1, 1]}
		>
			<ScrollView style={tw("")}>
				<SafeAreaView>
					<View style={tw("flex-row justify-between px-5 py-10")}>
						<View style={tw("flex-1 ")}>
							<View style={tw("p-5")}>
								<Input
									placeholder="Search..."
									value={input}
									onChangeText={(text) => setInput(text)}
									style={tw("text-sm rounded")}
									containerStyle={tw("pt-5 pb-0 px-5 bg-white rounded")}
								/>
							</View>

							{!loading ? (
								customers
									?.filter(
										(customer: Customer) =>
											customer.name.toLowerCase().includes(input.toLowerCase()) ||
											customer.code.toLowerCase().includes(input.toLowerCase())
									)
									.map((customer: Customer) => (
										<CustomerCard
											{...customer}
											key={customer.name}
											customer={customer}
											onPress={() => {
												const screenWidth = Dimensions.get("window").width;
												if (screenWidth < 1000) {
													navigation.navigate("CustomerModal", {
														customer: customer,
													});
												} else {
													setSelectedCustomer(customer);
												}
											}}
										/>
									))
							) : (
								<View>
									<Text>No customers found</Text>
								</View>
							)}
						</View>

						<View style={tw("hidden lg:block lg:flex-1 lg:p-5")}>
							{selectedCustomer && (
								<View style={[{ elevation: 2 }, tw("w-full h-full bg-white rounded min-h-[400px]")]}>
									<View style={[tw("p-5 h-full")]}>
										<Text style={[tw("text-center text-xl font-bold text-gray-600")]}>
											{selectedCustomer.name}
										</Text>
										<Text style={[tw("text-center italic text-sm mb-5")]}>
											Code: {selectedCustomer.code}
										</Text>
										<View style={tw("max-h-[300px] mb-5")}>
											<CustomerMap customer={selectedCustomer} />
										</View>

										<Pressable
											style={tw("bg-gray-500 px-5 py-2  my-3 rounded")}
											onPress={() =>
												Linking.openURL(
													`http://maps.google.com/maps?daddr=${selectedCustomer.lat},${selectedCustomer.lng}`
												)
											}
										>
											<Text style={tw("text-white text-center")}>Navigate with Google Maps</Text>
										</Pressable>
									</View>
								</View>
							)}
						</View>
					</View>
				</SafeAreaView>
			</ScrollView>
		</LinearGradient>
	);
};

export default CustomersScreen;
