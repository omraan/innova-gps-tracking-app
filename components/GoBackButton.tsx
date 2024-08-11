import { useRouter } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { useTailwind } from "tailwind-rn";

function GoBackButton() {
	const router = useRouter();
	const tw = useTailwind();
	return (
		<TouchableOpacity onPress={() => router.back()} style={tw("bg-gray-300 px-3 py-2 rounded")}>
			<Text style={tw("text-gray-700")}>Go Back</Text>
		</TouchableOpacity>
	);
}

export default GoBackButton;
