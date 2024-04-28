import { useQuery } from "@apollo/client";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Button, Icon, Image, Input } from "@rneui/themed";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useTailwind } from "tailwind-rn";
import OrderCard from "../components/OrderCard";
import { GET_ORDERS } from "../graphql/queries";
import { pickerSelectStyles } from "../lib/styles";
import { RootStackParamList } from "../navigator/RootNavigator";
import { TabStackParamList } from "../navigator/TabNavigator";
export type OrdersScreenNavigationProp = CompositeNavigationProp<
	BottomTabNavigationProp<TabStackParamList, "Orders">,
	NativeStackNavigationProp<RootStackParamList>
>;
const OrdersScreen = () => {
	const tw = useTailwind();
	const navigation = useNavigation<OrdersScreenNavigationProp>();
	const { loading, error, data } = useQuery(GET_ORDERS);

	const [date, setDate] = useState(new Date());
	const [dateRange, setDateRange] = useState("Week");
	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: false,
		});
	}, []);

	const onChange = (event: any, selectedDate: any) => {
		const currentDate = selectedDate || date;
		setDate(currentDate);
	};

	function getISOWeek(date: Date) {
		const tempDate: any = new Date(date.valueOf());
		const dayNumber = (date.getUTCDay() + 6) % 7;
		tempDate.setDate(tempDate.getDate() - dayNumber + 3);
		const firstThursday = tempDate.valueOf();
		tempDate.setMonth(0, 1);
		if (tempDate.getUTCDay() !== 4) {
			tempDate.setMonth(0, 1 + ((4 - tempDate.getUTCDay() + 7) % 7));
		}
		return 1 + Math.ceil((firstThursday - tempDate) / (7 * 24 * 3600 * 1000));
	}
	// useEffect(() => {
	// 	console.log("Orders", data);
	// 	console.log("Error", error);
	// }, [data, error]);

	return (
		<LinearGradient
			style={tw("h-full")}
			colors={["rgba(99, 102, 241, 1)", "rgba(99, 102, 241, 0.4)"]}
			start={[0, 0]}
			end={[1, 1]}
		>
			<ScrollView>
				<SafeAreaView>
					<View style={tw("p-5")}>
						<View>
							<View style={tw("bg-white p-5 flex-row justify-between items-center rounded mb-3")}>
								<View>
									<RNDateTimePicker display="compact" value={date} mode="date" onChange={onChange} />
								</View>
								{/* <Button title={dateRange} onPress={() => setShowPicker(true)} style={tw("w-[75px]")} /> */}
								<RNPickerSelect
									onValueChange={(value) => setDateRange(value)}
									items={[
										{ label: "Day", value: "Day" },
										{ label: "Week", value: "Week" },
										{ label: "Month", value: "Month" },
									]}
									style={{ ...pickerSelectStyles }}
									value={dateRange}
								/>
							</View>
						</View>
						{data?.getOrders
							?.filter((order: OrderList) => {
								const orderDate = new Date(Number(order.value.expectedDeliveryDate));
								if (dateRange === "Week") {
									return (
										orderDate.getFullYear() === date.getFullYear() &&
										getISOWeek(orderDate) === getISOWeek(date)
									);
								}
								return (
									orderDate.getFullYear() === date.getFullYear() &&
									orderDate.getMonth() === date.getMonth() &&
									(dateRange === "Day" ? orderDate.getDate() === date.getDate() : 1 === 1)
								);
							})
							.map((order: OrderList) => (
								<OrderCard order={order.value} key={order.name} orderId={order.name} />
							))}
					</View>
				</SafeAreaView>
			</ScrollView>
		</LinearGradient>
	);
};

export default OrdersScreen;
