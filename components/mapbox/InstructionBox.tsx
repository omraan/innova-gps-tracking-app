import { getDistance } from "@/lib/getDistance";
import { useDispatch } from "@/providers/DispatchProvider";
import { useLocation } from "@/providers/LocationProvider";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function InstructionBox({ steps, currentStep }: { steps: Step[]; currentStep: Step }) {
	const { liveLocation } = useLocation();
	const { dispatches, currentDispatch, currentStepIndex } = useDispatch();

	let nextStep: Step | null = steps[currentStepIndex + 1] || null;

	const actualDistance =
		(liveLocation &&
			getDistance(liveLocation, {
				latitude: currentStep.intersections[0].location[1],
				longitude: currentStep.intersections[0].location[0],
			})) ||
		0;
	function roundDistance(distance: number): number {
		if (distance <= 300) {
			return Math.round(distance / 50) * 50;
		} else {
			return Math.round(distance / 100) * 100;
		}
	}
	const roundedDistance = roundDistance(actualDistance);
	const getIconName = (type: string, modifier: string): string => {
		switch (type) {
			case "continue":
				if (modifier === "left") return "arrow-left";
				if (modifier === "right") return "arrow-right";
				break;
			case "turn":
				if (modifier === "left") return "arrow-left";
				if (modifier === "right") return "arrow-right";
				break;
			case "roundabout":
				return "rotate-3d";
			case "fork":
				if (modifier === "left") return "arrow-split-horizontal";
				if (modifier === "right") return "arrow-split-horizontal";
				break;
			case "merge":
				return "arrow-collapse-horizontal";
			case "ramp":
				if (modifier === "left") return "arrow-left";
				if (modifier === "right") return "arrow-right";
				break;
			case "end of road":
				if (modifier === "left") return "arrow-left";
				if (modifier === "right") return "arrow-right";
				break;
			default:
				return "arrow-right";
		}
		return "arrow-right";
	};
	const iconName = getIconName(currentStep.maneuver.type, currentStep.maneuver.modifier);

	return (
		<View className="absolute top-20 left-0 right-0 pt-20 pr-[90px] pl-5">
			<View className="bg-black/60 p-5 rounded-xl h-auto flex-row items-top gap-3">
				<View className="bg-black/50 flex-col items-center justify-center p-2 rounded">
					<Icon name={iconName} size={30} color="white" style={{ marginBottom: 5 }} />
					<Text className="text-sm text-white">{roundedDistance}m</Text>
				</View>

				<View className="flex-1">
					<Text className="text-2xl font-bold text-white leading-8">{currentStep.maneuver.instruction}</Text>
				</View>
			</View>
		</View>
	);
}
