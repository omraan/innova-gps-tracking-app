import { useQuery } from "@apollo/client";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image, Input } from "@rneui/themed";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useTailwind } from "tailwind-rn";
import CustomerCard from "../components/CustomerCard";
import { GET_CUSTOMERS } from "../graphql/queries";
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

	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: false,
		});
	}, []);

	return (
		<ScrollView style={tw("bg-gray-100")}>
			<SafeAreaView>
				<View>
					<View style={tw("p-5 rounded-lg")}>
						<Input
							placeholder="Search..."
							value={input}
							onChangeText={(text) => setInput(text)}
							style={tw("text-sm rounded")}
							containerStyle={tw("pt-5 pb-0 px-5 mb-2 bg-white rounded")}
						/>
					</View>

					{data?.getCustomers
						?.filter(
							(customer: CustomerList) =>
								customer.value.name.toLowerCase().includes(input.toLowerCase()) ||
								customer.value.code.toLowerCase().includes(input.toLowerCase())
						)
						.map((customer: CustomerList) => (
							<CustomerCard {...customer.value} key={customer.name} />
						))}
				</View>
			</SafeAreaView>
		</ScrollView>
	);
};

export default CustomersScreen;
