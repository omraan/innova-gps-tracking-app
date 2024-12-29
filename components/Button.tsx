import { forwardRef } from "react";
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View } from "react-native";

type ButtonProps = {
	title?: string;
} & TouchableOpacityProps;

export const Button = forwardRef<View, ButtonProps>(({ title, ...touchableProps }, ref) => {
	return (
		<TouchableOpacity
			ref={ref}
			{...touchableProps}
			style={[
				styles.button,
				touchableProps.style,
				{ backgroundColor: touchableProps.disabled ? "gray" : "#38C400" },
			]}
		>
			<Text style={styles.buttonText}>{title}</Text>
		</TouchableOpacity>
	);
});

const styles = StyleSheet.create({
	button: {
		alignItems: "center",
		backgroundColor: "#38C400",
		borderRadius: 10,
		elevation: 5,
		flexDirection: "row",
		justifyContent: "center",
		padding: 16,
		shadowColor: "#000",
		shadowOffset: {
			height: 2,
			width: 0,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	buttonText: {
		color: "#FFFFFF",
		fontSize: 18,
		fontWeight: "700",
		textAlign: "center",
	},
});