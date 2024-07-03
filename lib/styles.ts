import { StyleSheet } from "react-native";

export const pickerSelectStyles = StyleSheet.create({
	inputIOS: {
		fontSize: 16,
		paddingVertical: 12,
		paddingHorizontal: 20,
		backgroundColor: "white",
		borderWidth: 1,
		borderColor: "#e5e5e5",
		borderRadius: 4,
		color: "#444444",
		textAlign: "left",
	},
	inputAndroid: {
		fontSize: 16,
		paddingHorizontal: 10,
		paddingVertical: 8,
		backgroundColor: "white",
		borderWidth: 1,
		borderColor: "#e5e5e5",
		borderRadius: 4,
		color: "#444444",
		textAlign: "left",
		width: "100%",
	},
});
