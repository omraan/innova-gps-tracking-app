import { isColorDark } from "@/lib/styles";
import { useOrganization } from "@clerk/clerk-expo";
import { router } from "expo-router";
import React, { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useTailwind } from "tailwind-rn";

export default function ModalOrderChangeStatus({
	selectedCustomerOrders,
	dateString,
	modalVisible,
	setModalVisible,
	onMarkerSubmit,
}: {
	selectedCustomerOrders: CustomerOrders;
	dateString?: string;
	modalVisible: boolean;
	setModalVisible: (visible: boolean) => void;
	onMarkerSubmit: (status: StatusCategory) => void;
}) {
	const tw = useTailwind();

	const { organization } = useOrganization();
	const statusCategories: StatusCategory[] = Array.isArray(organization?.publicMetadata.statusCategories)
		? organization.publicMetadata.statusCategories.filter(
				(statusCategory) => statusCategory.name !== selectedCustomerOrders.status
		  )
		: [
				{
					color: "#000000",
					name: "Unknown",
				},
		  ];

	const singleOrderId = selectedCustomerOrders.orderIds[0];
	const { orderNumbers, customer } = selectedCustomerOrders;

	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={modalVisible}
			onRequestClose={() => {
				setModalVisible(!modalVisible);
			}}
		>
			<Pressable
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: "rgba(0, 0, 0, 0.5)",
				}}
				onPress={() => {
					setModalVisible(false);
				}}
			>
				<View style={[tw("rounded-lg bg-white m-5 px-8 py-10 max-w-[90%]")]}>
					{customer && (
						<View style={tw("mb-5 bg-gray-100 rounded-lg p-5")}>
							<Text style={tw("text-center text-sm text-gray-400 mb-3")}>Client Information</Text>
							<Text style={tw("text-center font-semibold mb-2")}>{customer.name}</Text>
							<Text style={tw("text-center font-semibold mb-2")}>{`${
								customer.streetName && customer.streetName
							} ${customer.streetNumber}`}</Text>
							<Text style={tw(`${!customer.city && "hidden"}`)}>{customer.city && customer.city}</Text>
							{singleOrderId && (
								<View style={tw("flex-row justify-between items-center mt-3")}>
									<Pressable
										onPress={() => {
											setModalVisible(false);
											router.push({
												pathname: `/orders/${selectedCustomerOrders.customerId}`,
												params: { dateString },
											});
										}}
										style={tw("flex-1 max-w-[200px] mx-auto")}
									>
										<View
											style={tw(
												"rounded py-3 ml-1 bg-white border border-gray-200 flex-row items-center justify-between px-5"
											)}
										>
											<Text style={tw("text-center text-gray-500 mr-2 ")}>See details</Text>
											<FontAwesome name="chevron-right" size={12} style={tw("text-gray-500")} />
										</View>
									</Pressable>
								</View>
							)}
						</View>
					)}
					<Text style={tw("text-center mb-4")}>
						Do you want to change the status of{" "}
						{orderNumbers && orderNumbers.length > 1 ? "these orders" : "this order"}?
					</Text>
					{orderNumbers && orderNumbers.length > 0 && (
						<View style={tw("flex flex-row justify-center items-center mb-5 flex-wrap")}>
							{orderNumbers.map((orderNumber: number) => (
								<View
									key={orderNumber}
									style={tw("m-2 bg-gray-100 rounded-lg px-3 py-2 border border-gray-200")}
								>
									<Text style={tw("text-center text-sm text-gray-700")}>
										{orderNumber && orderNumber.toString()}
									</Text>
								</View>
							))}
						</View>
					)}
					<View style={tw("flex-row justify-between items-center mb-5")}>
						{statusCategories &&
							statusCategories.length > 0 &&
							statusCategories.map((status) => (
								<Pressable
									key={status.name}
									onPress={() => {
										setModalVisible(false);
										onMarkerSubmit(status);
									}}
									style={[
										{ backgroundColor: status.color },
										tw(
											`flex-1 rounded py-4 mr-1 ${
												!isColorDark(status.color) && "border border-gray-200"
											}`
										),
									]}
								>
									<Text
										style={[
											tw(`text-center text-${isColorDark(status.color) ? "white" : "black"}`),
										]}
									>
										{status.name}
									</Text>
								</Pressable>
							))}
					</View>
					<View style={tw("flex-row justify-between items-center")}>
						<Pressable
							onPress={() => {
								setModalVisible(false);
							}}
							style={tw("flex-1 rounded py-4 ml-1 border border-gray-200 bg-gray-100")}
						>
							<Text style={tw("text-center")}>No changes, close window</Text>
						</Pressable>
					</View>
				</View>
			</Pressable>
		</Modal>
	);
}
