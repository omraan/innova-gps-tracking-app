import { Picker } from "@react-native-picker/picker";
import React, { useRef, useState } from "react";
import { Button, Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTailwind } from "tailwind-rn";

type ListItem = {
	value: string;
	label: string;
};

type ModalPickerProps = {
	currentItem?: string;
	list: ListItem[];
	onChange: (value: string) => void;
};

export const ModalPicker = ({ currentItem, list, onChange }: ModalPickerProps) => {
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedItem, setSelectedItem] = useState<ListItem>(
		list.find((item) => item.value === currentItem) || list[0]
	);

	const pickerRef = useRef<any>(null);
	const tw = useTailwind();

	const handleSelectItem = (value: string) => {
		const newSelectedItem = list.find((item) => item.value === value);
		if (newSelectedItem) {
			setSelectedItem(newSelectedItem);
			onChange(value);
		}
		setModalVisible(false);
	};

	return (
		<View>
			<Pressable onPress={() => setModalVisible(true)}>
				<View style={tw("rounded px-2 py-2 border border-gray-300 flex flex-row justify-between")}>
					<Text style={tw("mr-5")}>{selectedItem?.label}</Text>
					<Icon name="chevron-down" size={15} />
				</View>
			</Pressable>
			<Modal
				animationType="slide"
				transparent={true}
				visible={modalVisible}
				onRequestClose={(e) => {
					e.preventDefault();
					setModalVisible(false);
				}}
			>
				<TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPressOut={() => setModalVisible(false)}>
					<View style={{ flex: 1, justifyContent: "flex-end" }}>
						<View style={{ backgroundColor: "white", padding: 20 }}>
							<Picker
								ref={pickerRef}
								onValueChange={handleSelectItem}
								selectedValue={selectedItem?.value || list[0].value}
							>
								{list.map((item) => (
									<Picker.Item key={item.value} label={item.label} value={item.value} />
								))}
							</Picker>
						</View>
					</View>
				</TouchableOpacity>
			</Modal>
		</View>
	);
};
