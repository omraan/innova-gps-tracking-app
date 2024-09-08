import React from "react";
import { ScrollView, View, useWindowDimensions } from "react-native";

export const DeviceDependedView = ({
	children,
	tabletLandscapeView,
}: {
	children: React.ReactNode;
	tabletLandscapeView: string;
}) => {
	const { width, height } = useWindowDimensions();

	const isLandscape = width > height;
	const isTablet = width >= 768;

	const view = <View>{children}</View>;
	const scrollView = (
		<ScrollView
			contentContainerStyle={{
				flexGrow: 1,
			}}
			style={{ flex: 1 }}
		>
			{children}
		</ScrollView>
	);

	if (tabletLandscapeView === "scroll") {
		return isLandscape && isTablet ? scrollView : view;
	} else {
		return isLandscape && isTablet ? view : scrollView;
	}
};
