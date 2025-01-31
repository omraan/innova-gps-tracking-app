import { Modal as RnModal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

interface ModalProps {
	children: React.ReactNode;
	handleSave: (() => void) | null;
	modalVisible: boolean;
	setModalVisible: (visible: boolean) => void;
}

export const Modal: React.FC<ModalProps> = ({ children, handleSave, modalVisible, setModalVisible }: ModalProps) => {
	const handleCloseModal = () => {
		setModalVisible(false);
	};

	return (
		<RnModal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={handleCloseModal}>
			<View style={styles.modalOverlay}>
				<View
					className="bg-white rounded-lg flex flex-col justify-center items-center p-8"
					style={{ width: "80%" }}
				>
					{children}

					<View className="flex-row gap-5 mt-2">
						{handleSave && (
							<TouchableOpacity onPress={handleSave} className="flex-1 bg-secondary py-4 rounded">
								<Text className="font-semibold text-center text-white text-md">Save</Text>
							</TouchableOpacity>
						)}
						<TouchableOpacity onPress={handleCloseModal} className="flex-1 bg-gray-500 py-4 rounded">
							<Text className="font-semibold text-center text-white text-md">Cancel</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</RnModal>
	);
};
const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
});
