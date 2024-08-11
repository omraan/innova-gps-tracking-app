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

export const isColorDark = (color: string) => {
	const hex = color.replace("#", "");
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);
	// Bereken de luminantie
	const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
	return luminance < 128;
};
