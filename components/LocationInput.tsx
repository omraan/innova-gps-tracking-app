import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from "react-native";
import { useTailwind } from "tailwind-rn";

export default function LocationInput({
	setChangingLocation,
	onChangingLocationSubmit,
}: {
	onChangingLocationSubmit(newLocation: { latitude: number; longitude: number } | null): void;
	setChangingLocation(value: boolean): void;
}) {
	const tw = useTailwind();

	const [inputValue, setInputValue] = useState<string>("");
	const isValidGeoLocation = (value: string): boolean => {
		// Regex patterns for different geolocation formats
		const decimalPattern = /^-?\d{1,2}\.\d+,\s*-?\d{1,3}\.\d+$/;
		const dmsPattern =
			/^-?\d{1,2}°\s*\d{1,2}'\s*\d{1,2}(\.\d+)?"\s*[NSEW]\s*-?\d{1,3}°\s*\d{1,2}'\s*\d{1,2}(\.\d+)?"\s*[NSEW]$/;
		const decimalWithDirectionPattern = /^-?\d{1,2}\.\d+\s*[NS],\s*-?\d{1,3}\.\d+\s*[EW]$/;

		return decimalPattern.test(value) || dmsPattern.test(value) || decimalWithDirectionPattern.test(value);
	};

	const parseGeoLocation = (value: string) => {
		if (value.includes(",")) {
			// Check if it's the decimal with direction format
			const decimalWithDirectionPattern = /(-?\d{1,2}\.\d+)\s*([NS]),\s*(-?\d{1,3}\.\d+)\s*([EW])/;
			const match = value.match(decimalWithDirectionPattern);
			if (match) {
				const latitude = parseFloat(match[1]) * (match[2] === "S" ? -1 : 1);
				const longitude = parseFloat(match[3]) * (match[4] === "W" ? -1 : 1);
				return { latitude, longitude };
			}

			// Decimal format
			const [latitude, longitude] = value.split(",").map((coord) => parseFloat(coord.trim()));
			return { latitude, longitude };
		} else {
			// DMS format
			const dmsPattern = /(\d{1,2})°\s*(\d{1,2})'\s*(\d{1,2}(\.\d+)?)"\s*([NSEW])/g;
			const matches = [...value.matchAll(dmsPattern)];

			const convertDMSToDecimal = (degrees: number, minutes: number, seconds: number, direction: string) => {
				let decimal = degrees + minutes / 60 + seconds / 3600;
				if (direction === "S" || direction === "W") {
					decimal *= -1;
				}
				return decimal;
			};

			const latitude = convertDMSToDecimal(
				parseInt(matches[0][1]),
				parseInt(matches[0][2]),
				parseFloat(matches[0][3]),
				matches[0][5]
			);
			const longitude = convertDMSToDecimal(
				parseInt(matches[1][1]),
				parseInt(matches[1][2]),
				parseFloat(matches[1][3]),
				matches[1][5]
			);

			return { latitude, longitude };
		}
	};

	useEffect(() => {
		const trimmedInputValue = inputValue.replace(/[()]/g, "");
		if (isValidGeoLocation(trimmedInputValue)) {
			const newMarker = parseGeoLocation(trimmedInputValue);
			if (newMarker) {
				setChangingLocation(false);
				onChangingLocationSubmit(newMarker);
			}
		} else {
			console.log("not valid");
		}
	}, [inputValue]);
	return (
		<View style={tw("justify-center px-4")}>
			<Text style={tw("text-center mb-2 mt-5")}>Paste here Geo Location or click anywhere on map</Text>
			<TextInput
				style={tw(
					`px-4 pt-3 h-16 pb-4 border border-gray-300 rounded-lg text-gray-600 text-lg mb-10 w-full mx-auto tracking-wider`
				)}
				value={inputValue}
				onChangeText={setInputValue}
				placeholder="Paste geo location..."
				autoCapitalize="none"
			/>
		</View>
	);
}
