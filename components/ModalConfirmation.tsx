import { useRouteSessionStore } from "@/hooks/useRouteSessionStore";
import { useSelectionStore } from "@/hooks/useSelectionStore";
import { isColorDark } from "@/lib/styles";
import { useMetadata } from "@/providers/MetaDataProvider";
import Feather from "@expo/vector-icons/Feather";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Modal } from "./Modal";

type ModalPickerProps = {};

export const ModalConfirmation = ({ handleSave }: { handleSave: (status: StatusCategory | null) => void }) => {
	const [modalVisible, setModalVisible] = useState(false);
	const { statusCategories } = useMetadata();
	const { selectedRoute, selectedRouteStop } = useSelectionStore();
	const handleOpenModal = () => {
		setModalVisible(true);
	};
	const [selectedStatus, setSelectedStatus] = useState<StatusCategory | null>(null);

	const handleStatusPress = (status: StatusCategory) => {
		if (selectedRoute?.value.actual.active) {
			setSelectedStatus(status);
			handleOpenModal();
		}
	};

	return (
		<View>
			<View className="flex-row justify-between items-center mb-5">
				{statusCategories &&
					statusCategories.length > 0 &&
					statusCategories
						.filter((s) => s.name !== "No Location")
						.map((status) => (
							<TouchableOpacity
								key={status.name}
								onPress={() => handleStatusPress(status)}
								disabled={!selectedRoute?.value.actual.active}
								className="flex-1 rounded py-4 mx-1"
								style={{
									borderWidth: !isColorDark(status.color) ? 1 : 0,
									borderColor: "#dddddd",
									backgroundColor: status.color,
									opacity: !selectedRoute?.value.actual.active ? 0.5 : 1,
									display: status.name !== selectedRouteStop?.value.status ? "flex" : "none",
								}}
							>
								<Text
									className="text-center"
									style={{ color: isColorDark(status.color) ? "white" : "#666666" }}
								>
									{status.name}
								</Text>
							</TouchableOpacity>
						))}
			</View>

			<Modal
				modalVisible={modalVisible}
				setModalVisible={setModalVisible}
				handleSave={() => handleSave(selectedStatus)}
			>
				<View className="mb-10">
					<Text className="font-semibold text-2xl text-center mb-5">Change Status</Text>
					<Text className="font-normal text-gray-500 text-center mb-10">
						Select the new status for this order: {selectedRouteStop?.value.displayName}
					</Text>
					<View className="border rounded px-5 py-2 mx-auto" style={{ borderColor: selectedStatus?.color }}>
						<Text
							className="font-bold text-primary text-center text-2xl"
							style={{ color: selectedStatus?.color }}
						>
							{selectedStatus?.name}
						</Text>
					</View>
				</View>
			</Modal>
		</View>
	);
};
