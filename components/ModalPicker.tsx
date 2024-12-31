import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Modal } from "./Modal";

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

	const handleSelectItem = (value: string) => {
		if (value === "all") {
			setSelectedItem(null);
		} else {
			const item = list.find((item) => item.value === value) || null;
			setSelectedItem(item);
		}
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
		setModalVisible(true);
	};
	console.log(
		"default value",
		list.find((item) => item.value === options?.defaultValue)
	);

	return (
		<View>
			<View>
				<TouchableOpacity
					className="border border-gray-300 p-4 rounded flex-row my-5 items-center"
					onPress={handleOpenModal}
					disabled={disabled}
					style={{ opacity: disabled ? 0.5 : 1 }}
				>
					<Text className="text-gray-500 flex-1 text-lg font-semibold">
						{list.find((item) => item.value === options?.defaultValue)?.label || "Choose option"}
					</Text>
					<Icon name="chevron-down" size={15} />
				</TouchableOpacity>

				<Modal modalVisible={modalVisible} setModalVisible={setModalVisible} handleSave={handleSave}>
					{options?.displayAll ? (
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
					) : (
						<View />
					)}

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
							{item.label === selectedItem?.label && <Feather name="check" size={24} color="#6366f1" />}
						</TouchableOpacity>
					))}
				</Modal>
			</View>
		</View>
	);
};
