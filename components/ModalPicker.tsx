import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useRef, useState } from "react";
import {
	Button,
	Modal,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTailwind } from "tailwind-rn";

type ListItem = {
	value: string;
	label: string;
};

type ModalPickerProps = {
	list: ListItem[];
	options?: {
		defaultValue?: string;
		displayAll?: boolean;
		displayAllLabel?: string;
	};
	onSelect: (value: string) => void;
	disabled?: boolean;
};

export const ModalPicker = ({ list, onSelect, options, disabled = false }: ModalPickerProps) => {
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedItem, setSelectedItem] = useState<ListItem | null>(
		list.find((item) => item.value === options?.defaultValue) || null
	);

	const pickerRef = useRef<any>(null);
	const tw = useTailwind();

	const handleSelectItem = (value: string) => {
		if (value === "all") {
			setSelectedItem(null);
		} else {
			const item = list.find((item) => item.value === value) || null;
			setSelectedItem(item);
		}
		// onSelect(value);
	};

	const handleSave = () => {
		if (selectedItem) {
			onSelect(selectedItem.value);
		} else {
			onSelect("all");
		}
		setModalVisible(false);
	};

	const handleOpenModal = () => {
		console.log("open modal");
		setModalVisible(true);
	};

	const handleCloseModal = () => {
		console.log("close modal");
		setModalVisible(false);
	};
	// useEffect(() => {
	// 	if (Platform.OS === "android" && modalVisible) {
	// 		if (modalVisible) {
	// 			pickerRef.current?.focus();
	// 		}
	// 	}
	// }, [modalVisible]);

	return (
		<View>
			<View>
				<TouchableOpacity
					className="border border-gray-300 p-4 rounded flex-row my-5 items-center"
					onPress={handleOpenModal}
					disabled={disabled}
				>
					<Text className="text-gray-500 flex-1 text-lg font-semibold">
						{list.find((item) => item.value === options?.defaultValue)?.label || "Choose option"}
					</Text>
					<Icon name="chevron-down" size={15} />
				</TouchableOpacity>

				<Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={handleCloseModal}>
					<TouchableWithoutFeedback onPress={handleCloseModal}>
						<View style={styles.modalOverlay}>
							<TouchableWithoutFeedback>
								<View
									className="bg-white rounded-lg flex flex-col justify-center items-center p-8"
									style={{ width: "80%" }}
								>
									<TouchableOpacity
										onPress={() => {
											if (options?.displayAll) {
												handleSelectItem("all");
											}
										}}
										className="flex-row justify-start items-center gap-5 py-3 px-5 text-gray-400 w-full mb-3"
										style={{
											borderWidth: 1,
											borderColor: !selectedItem ? "#6366f1" : "#9ca3af",
											padding: 10,
											borderRadius: 5,
										}}
									>
										<Text
											className="text-lg flex-1"
											style={{
												color: !selectedItem ? "#6366f1" : "#9ca3af",
											}}
										>
											{options?.displayAllLabel || "All"}
										</Text>
										{!selectedItem && <Feather name="check" size={24} color="#6366f1" />}
									</TouchableOpacity>
									{list.map((item) => (
										<TouchableOpacity
											key={item.value}
											onPress={() => handleSelectItem(item.value)}
											className="flex-row justify-start items-center gap-5 py-3 px-5 text-gray-400 w-full mb-3"
											style={{
												borderWidth: 1,
												borderColor: item.label === selectedItem?.label ? "#6366f1" : "#9ca3af",
												padding: 10,
												borderRadius: 5,
											}}
										>
											<Text
												className="text-lg flex-1"
												style={{
													color: item.label === selectedItem?.label ? "#6366f1" : "#9ca3af",
												}}
											>
												{item.label}
											</Text>
											{item.label === selectedItem?.label && (
												<Feather name="check" size={24} color="#6366f1" />
											)}
										</TouchableOpacity>
									))}

									<View className="flex-row gap-5 mt-2">
										<TouchableOpacity
											onPress={handleSave}
											className="flex-1 bg-secondary py-4 rounded"
										>
											<Text className="font-semibold text-center text-white text-md">Save</Text>
										</TouchableOpacity>
										<TouchableOpacity
											onPress={handleCloseModal}
											className="flex-1 bg-gray-500 py-4 rounded"
										>
											<Text className="font-semibold text-center text-white text-md">Cancel</Text>
										</TouchableOpacity>
									</View>
								</View>
							</TouchableWithoutFeedback>
						</View>
					</TouchableWithoutFeedback>
				</Modal>
			</View>
		</View>
	);
};
const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	// modalContent: {
	// 	width: "80%",
	// 	backgroundColor: "white",
	// 	padding: 20,
	// 	borderRadius: 10,
	// },
});
