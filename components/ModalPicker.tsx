import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useRef, useState } from "react";
import { Button, Modal, Platform, Pressable, Text, TouchableOpacity, View } from "react-native";
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
		onSelect(value);
	};

	const handleOpenModal = () => {
		setModalVisible(true);
	};

	const handleCloseModal = () => {
		setModalVisible(false);
	};
	useEffect(() => {
		if (Platform.OS === "android" && modalVisible) {
			if (modalVisible) {
				pickerRef.current?.focus();
			}
		}
	}, [modalVisible]);

	return (
		<View>
			{Platform.OS === "android" ? (
				<View style={tw(`rounded border border-gray-300 w-full ${disabled ? "opacity-30" : "opacity-100"}`)}>
					<Picker
						ref={pickerRef}
						onValueChange={handleSelectItem}
						selectedValue={selectedItem?.value || options?.displayAllLabel}
						enabled={!disabled}
					>
						{options?.displayAll ? (
							<Picker.Item label={options?.displayAllLabel || "All"} value={"all"} />
						) : (
							!selectedItem && <Picker.Item label="Choose option" />
						)}
						{list.map((item, index) => (
							<Picker.Item key={index} label={item.label} value={item.value} />
						))}
					</Picker>
				</View>
			) : (
				<View>
					<Pressable onPress={handleOpenModal} disabled={disabled}>
						<View
							style={tw(
								`rounded px-2 py-2 border border-gray-300 flex flex-row justify-between ${
									disabled ? "opacity-30" : "opacity-100"
								}`
							)}
						>
							<Text style={tw("mr-5")}>
								{selectedItem?.label || options?.displayAllLabel || "Choose option"}
							</Text>
							<Icon name="chevron-down" size={15} />
						</View>
					</Pressable>
					<Modal
						animationType="slide"
						transparent={true}
						visible={modalVisible}
						onRequestClose={handleCloseModal}
					>
						<TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPressOut={handleCloseModal}>
							<View style={{ flex: 1, justifyContent: "flex-end" }}>
								<View style={{ backgroundColor: "#ffffff" }}>
									<Picker
										ref={pickerRef}
										onValueChange={handleSelectItem}
										selectedValue={selectedItem?.value || options?.displayAllLabel}
										// itemStyle={{ fontSize: 20 }}
										// style={{ display: Platform.OS === "android" ? "none" : "flex" }}
									>
										{options?.displayAll ? (
											<Picker.Item label={options?.displayAllLabel || "All"} value={"all"} />
										) : (
											!selectedItem && <Picker.Item label="Choose option" />
										)}
										{list.map((item, index) => (
											<Picker.Item key={index} label={item.label} value={item.value} />
										))}
									</Picker>
								</View>
							</View>
						</TouchableOpacity>
					</Modal>
				</View>
			)}
		</View>
	);
};
