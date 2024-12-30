import { Feather } from "@expo/vector-icons";
import RNDateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import moment from "moment";
import React, { useRef } from "react";
import { Modal, Platform, Pressable, Text, TouchableOpacity, View } from "react-native";

interface DateTimePickerProps {
	onChange: (date: Date) => void;
	currentDate: Date;
}
export default function DateTimePicker(props: DateTimePickerProps) {
	if (Platform.OS === "ios") {
		return <IOSDateTimePicker {...props} />;
	}
	if (Platform.OS === "android") {
		return <AndroidDateTimePicker {...props} />;
	}
}

export const AndroidDateTimePicker = ({ onChange, currentDate }: DateTimePickerProps) => {
	const showDateTimePicker = () => {
		DateTimePickerAndroid.open({
			value: currentDate,
			mode: "date",
			onChange: (event, selectedDate) => onChange(selectedDate || new Date()),
		});
	};
	return (
		<Pressable onPress={showDateTimePicker}>
			<View className="w-full px-5 bg-gray-200 text-gray-700 font-semibold py-2 rounded">
				<Text className="text-gray-700 text-sm">{moment(currentDate).format("yyyy-MM-DD")}</Text>
			</View>
		</Pressable>
	);
};

export const IOSDateTimePicker = ({ onChange, currentDate }: DateTimePickerProps) => {
	const [modalVisible, setModalVisible] = React.useState(false);

	return (
		<TouchableOpacity
			className="border border-gray-300 p-4 rounded flex-row my-5 items-center"
			onPress={() => {
				setModalVisible(true);
			}}
		>
			<Text className="text-gray-500 flex-1 text-lg font-semibold">
				{moment(currentDate).format("yyyy-MM-DD")}
			</Text>
			<Feather name="calendar" size={18} color="#6b7280" />

			<Modal
				animationType="fade"
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => {
					setModalVisible(!modalVisible);
				}}
			>
				<TouchableOpacity
					className="bg-black/50 h-full flex justify-center items-center"
					onPress={() => {
						setModalVisible(false);
					}}
				>
					<View className="flex justify-center items-center">
						<View className="px-8 py-4 bg-white rounded-lg">
							<RNDateTimePicker
								testID="dateTimePicker"
								display="inline"
								value={currentDate}
								mode="date"
								onChange={(event, selectedDate) => {
									onChange(selectedDate || new Date());
									setModalVisible(false);
								}}
								// disabled={routeSession ? true : false}
								// style={tw(`${routeSession ? "opacity-30" : "opacity-100"} `)}
								// textColor="black"
							/>
						</View>
					</View>
				</TouchableOpacity>
			</Modal>
		</TouchableOpacity>
	);
};
