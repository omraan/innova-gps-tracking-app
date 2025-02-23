import { getBearing } from "@/lib/getBearing"; // Voeg deze functie toe aan je lib
import { getDistance } from "@/lib/getDistance";
import { act, renderHook } from "@testing-library/react-hooks";
import { useEffect, useState } from "react";

const mockSteps = [
	{
		maneuver: {
			location: [4.895168, 52.370216], // Amsterdam
		},
	},
	{
		maneuver: {
			location: [4.899431, 52.379189], // Amsterdam Centraal
		},
	},
	{
		maneuver: {
			location: [4.914694, 52.367984], // Artis
		},
	},
];

const mockLiveLocation = {
	latitude: 52.370216,
	longitude: 4.895168,
	heading: 0, // Noord
};

const useMockRoute = () => {
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [liveLocation, setLiveLocation] = useState(mockLiveLocation);

	useEffect(() => {
		const steps = mockSteps;
		let closestStepIndex = 0;
		let minDistance = Infinity;
		const thresholdDistance = 50; // Stel een drempelwaarde in (bijv. 50 meter)

		if (steps && steps.length > 0) {
			steps.forEach((step, index) => {
				const distance = getDistance(
					{ latitude: liveLocation.latitude, longitude: liveLocation.longitude },
					{ latitude: step.maneuver.location[1], longitude: step.maneuver.location[0] }
				);
				if (distance < minDistance) {
					minDistance = distance;
					closestStepIndex = index;
				}
			});

			const currentStepDistance = getDistance(
				{ latitude: liveLocation.latitude, longitude: liveLocation.longitude },
				{
					latitude: steps[closestStepIndex].maneuver.location[1],
					longitude: steps[closestStepIndex].maneuver.location[0],
				}
			);

			if (liveLocation.heading !== null) {
				const nextStepIndex = closestStepIndex + 1;
				if (nextStepIndex < steps.length) {
					const nextStep = steps[nextStepIndex];
					const bearingToNextStep = getBearing(
						{ latitude: liveLocation.latitude, longitude: liveLocation.longitude },
						{ latitude: nextStep.maneuver.location[1], longitude: nextStep.maneuver.location[0] }
					);

					const headingDifference = Math.abs(liveLocation.heading - bearingToNextStep);
					if (headingDifference < 45 || headingDifference > 315) {
						if (currentStepDistance > thresholdDistance) {
							setCurrentStepIndex(nextStepIndex);
						} else {
							setCurrentStepIndex(closestStepIndex);
						}
					} else {
						setCurrentStepIndex(closestStepIndex);
					}
				} else {
					setCurrentStepIndex(closestStepIndex);
				}
			} else {
				setCurrentStepIndex(closestStepIndex);
			}
		}
	}, [liveLocation]);

	return { currentStepIndex, setLiveLocation };
};

test("should update currentStepIndex correctly", () => {
	const { result } = renderHook(() => useMockRoute());

	// Initial step index should be 0
	expect(result.current.currentStepIndex).toBe(0);

	// Simulate moving towards the next step
	act(() => {
		result.current.setLiveLocation({
			latitude: 52.379189,
			longitude: 4.899431,
			heading: 0, // Noord
		});
	});

	console.log("result.current.currentStepIndex", result.current.currentStepIndex);

	// Step index should update to 1
	expect(result.current.currentStepIndex).toBe(1);

	// Simulate moving towards the next step
	act(() => {
		result.current.setLiveLocation({
			latitude: 52.367984,
			longitude: 4.914694,
			heading: 90, // Oost
		});
	});

	// Step index should update to 2
	expect(result.current.currentStepIndex).toBe(2);
});
