import Toast from "react-native-toast-message";

export default async function toastPromise(
	promise: any,
	messages: {
		loading: string;
		success: string;
		error: string;
	}
) {
	// Toon een loading toast
	Toast.show({
		type: "info",
		text1: messages.loading,
	});

	try {
		const result = await promise;

		// Toon een success Toast
		Toast.show({
			type: "success",
			text1: messages.success,
		});

		return result;
	} catch (error: any) {
		// Toon een error Toast
		Toast.show({
			type: "error",
			text1: messages.error,
			text2: error?.message,
		});

		throw error;
	}
}
