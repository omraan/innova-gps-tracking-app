import { useDateStore } from "@/hooks/useDateStore";
import { useRouteSessionStore } from "@/hooks/useRouteSessionStore";
import { isColorDark } from "@/lib/styles";
import { useAuth, useOrganization, useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useTailwind } from "tailwind-rn";

export default function ModalOrderChangeStatus({
	selectedCustomerOrders,
	showLink,
	modalVisible,
	setModalVisible,
	onMarkerSubmit,
}: {
	selectedCustomerOrders: CustomerOrders;
	showLink?: boolean;
	modalVisible: boolean;
	setModalVisible: (visible: boolean) => void;
	onMarkerSubmit: (status: StatusCategory, notes: string) => void;
}) {
	const tw = useTailwind();
	const { user } = useUser();
	const { orgId, orgRole: authRole } = useAuth();
	const { selectedDate } = useDateStore();
	const { routeSession } = useRouteSessionStore();

	const { organization } = useOrganization();
	const statusCategories: StatusCategory[] = Array.isArray(organization?.publicMetadata.statusCategories)
		? organization.publicMetadata.statusCategories.filter(
				(statusCategory) =>
					statusCategory.name !== selectedCustomerOrders.status && statusCategory.name !== "No Location"
		  )
		: [
				{
					color: "#000000",
					name: "Unknown",
				},
		  ];

	const singleOrderId = selectedCustomerOrders.orderIds[0];
	const { orderNumbers, customer } = selectedCustomerOrders;

	const [notes, setNotes] = useState<string>("");

	const [orgRole, setOrgRole] = useState<string | undefined>();

	useEffect(() => {
		const metaDataLabels = user?.publicMetadata as UserPublicMetadata;
		if (authRole === "org:admin") {
			setOrgRole("org:admin");
		} else {
			if (
				orgId &&
				metaDataLabels &&
				metaDataLabels.organizations &&
				metaDataLabels.organizations[orgId]?.orgRole
			) {
				setOrgRole(metaDataLabels.organizations[orgId].orgRole);
			}
		}
	}, [user?.publicMetadata, orgId]);

	const showOrderNumbers =
		orderNumbers && orderNumbers.length > 0 && orderNumbers.some((orderNumber) => orderNumber !== null);

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
				// onPress={() => {
				// 	setModalVisible(false);
				// }}
			>
				<KeyboardAvoidingView
					style={tw("flex-1 justify-center items-center")}
					behavior={Platform.OS === "ios" ? "padding" : "height"}
				>
					<ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}>
						<View style={[tw("rounded-lg bg-white m-5 px-8 py-10 max-w-[90%] min-w-[325px]")]}>
							{customer && (
								<View style={tw("mb-5 bg-gray-100 rounded-lg p-5")}>
									<Text style={tw("text-center text-sm text-gray-400 mb-3")}>Client Information</Text>
									<Text style={tw("text-center font-semibold mb-2")}>{customer.name}</Text>
									<Text style={tw("text-center font-semibold mb-2")}>{`${
										customer.streetName && customer.streetName
									} ${customer.streetNumber && customer.streetNumber}`}</Text>
									{customer.city && (
										<Text style={tw("text-center font-semibold mb-2")}>{customer.city}</Text>
									)}
									{customer.phoneNumber && (
										<Text style={tw("text-center font-semibold mb-2")}>{customer.phoneNumber}</Text>
									)}
									{customer.phoneNumber2 && (
										<Text style={tw("text-center font-semibold mb-2")}>
											{customer.phoneNumber2}
										</Text>
									)}
									{customer.phoneNumber3 && (
										<Text style={tw("text-center font-semibold mb-2")}>
											{customer.phoneNumber3}
										</Text>
									)}

									{singleOrderId && showLink && (
										<View style={tw("flex-row justify-between items-center mt-3")}>
											<Pressable
												onPress={() => {
													setModalVisible(false);
													router.push({
														pathname: `/orders/[customerId]`,
														params: {
															customerId: selectedCustomerOrders.customerId!,
															selectedDate,
														},
													});
												}}
												style={tw("flex-1 max-w-[200px] mx-auto")}
											>
												<View
													style={tw(
														"rounded py-3 ml-1 bg-white border border-gray-200 flex-row items-center justify-between px-5"
													)}
												>
													<Text style={tw("text-center text-gray-500 mr-2 ")}>
														See details
													</Text>
													<FontAwesome
														name="chevron-right"
														size={12}
														style={tw("text-gray-500")}
													/>
												</View>
											</Pressable>
										</View>
									)}
								</View>
							)}
							{selectedCustomerOrders.notes || selectedCustomerOrders.customer.notes ? (
								<View style={tw("mb-5 bg-gray-100 rounded-lg p-5")}>
									<Text style={tw("text-center text-sm text-gray-400 mb-3")}>Notes</Text>
									<Text
										style={tw(
											`text-center max-w-[300px] flex flex-wrap ${
												selectedCustomerOrders.notes ? "mb-5" : "mb-0"
											}`
										)}
									>
										{selectedCustomerOrders.customer.notes}
									</Text>
									<Text style={tw("text-center max-w-[300px] flex flex-wrap")}>
										{selectedCustomerOrders.notes}
									</Text>
								</View>
							) : (
								<View></View>
							)}

							{showOrderNumbers && (
								<View style={tw("flex flex-row justify-center items-center mb-5 flex-wrap")}>
									{orderNumbers.map((orderNumber: number, index: number) => (
										<View
											key={index}
											style={tw("m-2 bg-gray-100 rounded-lg px-3 py-2 border border-gray-200")}
										>
											<Text style={tw("text-center text-sm text-gray-700 text-wrap")}>
												{orderNumber !== null ? orderNumber.toString() : "No order number"}
											</Text>
										</View>
									))}
								</View>
							)}

							{orgRole &&
								orgRole !== "org:viewer" &&
								selectedDate == moment(new Date()).format("yyyy-MM-DD") && (
									<View>
										{routeSession === null && (
											<View style={tw("bg-red-200 border border-red-400 p-3 rounded mb-5")}>
												<Text style={tw("text-xs text-red-700")}>
													Please Press "Start route" before updating status
												</Text>
											</View>
										)}
										<View style={tw("mb-5")}>
											<TextInput
												placeholder={
													orgRole && orgRole !== "org:viewer" ? "Type Notes" : "No notes"
												}
												placeholderTextColor="#999"
												value={notes}
												onChangeText={setNotes}
												style={tw(
													`text-sm rounded text-gray-700 border-b pb-2 border-gray-300 flex flex-wrap max-w-[300px] text-wrap ${
														routeSession === null ? "opacity-50" : "opacity-100"
													}`
												)}
												editable={
													orgRole && orgRole !== "org:viewer" && routeSession !== null
														? true
														: false
												}
												multiline={true}
												numberOfLines={4}
											/>
										</View>

										<View style={tw("flex-row justify-between items-center mb-5")}>
											{statusCategories &&
												statusCategories.length > 0 &&
												statusCategories.map((status) => (
													<Pressable
														key={status.name}
														onPress={() => {
															if (routeSession && routeSession !== null) {
																setModalVisible(false);
																onMarkerSubmit(status, notes);
																setNotes("");
															}
														}}
														disabled={routeSession === null}
														style={[
															{ backgroundColor: status.color },
															tw(
																`flex-1 rounded py-4 mx-1 ${
																	!isColorDark(status.color)
																		? "border border-gray-200"
																		: ""
																} ${
																	routeSession === null ? "opacity-50" : "opacity-100"
																}`
															),
														]}
													>
														<Text
															style={[
																tw(
																	`text-center text-${
																		isColorDark(status.color) ? "white" : "gray-700"
																	}`
																),
															]}
														>
															{status.name}
														</Text>
													</Pressable>
												))}
										</View>
									</View>
								)}

							<View style={tw("flex-row justify-between items-center")}>
								<Pressable
									onPress={() => {
										setModalVisible(false);
									}}
									style={tw("flex-1 rounded py-4 mx-1 border border-gray-200 bg-gray-100")}
								>
									<Text style={tw("text-center")}>
										{orgRole !== "org:viewer" && "No changes. "}Close window
									</Text>
								</Pressable>
							</View>
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			</Pressable>
		</Modal>
	);
}
