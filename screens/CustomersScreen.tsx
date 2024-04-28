import { useQuery } from "@apollo/client";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Input } from "@rneui/themed";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { useTailwind } from "tailwind-rn";
import CustomerCard from "../components/CustomerCard";
import { GET_CUSTOMERS } from "../graphql/queries";
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
	const { loading, error, data } = useQuery(GET_CUSTOMERS);
	const { selectedUser } = useUserStore();
	const [loadingCustomers, setLoadingCustomers] = useState(true);
	const { customers } = useCustomerStore();
	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: false,
		});
	}, []);
	useEffect(() => {
		if (customers.length > 0 && selectedUser?.selectedOrganisationId) {
			setLoadingCustomers(false);
			console.log("Customers", customers);
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
					<View>
						<View style={tw("p-5")}>
							<Input
								placeholder="Search..."
								value={input}
								onChangeText={(text) => setInput(text)}
								style={tw("text-sm rounded")}
								containerStyle={tw("pt-5 pb-0 px-5 bg-white rounded")}
							/>
						</View>

						{!loadingCustomers ? (
							customers
								?.filter(
									(customer: Customer) =>
										customer.name.toLowerCase().includes(input.toLowerCase()) ||
										customer.code.toLowerCase().includes(input.toLowerCase())
								)
								.map((customer: Customer) => <CustomerCard {...customer} key={customer.name} />)
						) : (
							<View>
								<Text>No customers found</Text>
							</View>
						)}
					</View>
				</SafeAreaView>
			</ScrollView>
		</LinearGradient>
	);
};

export default CustomersScreen;
