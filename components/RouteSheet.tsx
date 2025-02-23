import { useSelectionStore } from "@/hooks/useSelectionStore";
import { useSheetContext } from "@/providers/SheetProvider";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import RouteStopList from "./RouteStopList";

export default function RouteSheet() {
	const { bottomSheetRefs, handlePanDownToClose, setActiveSheet } = useSheetContext();
	const { selectedRoute } = useSelectionStore();
	return (
		<BottomSheet
			ref={bottomSheetRefs.route}
			index={-1}
			snapPoints={["70%"]}
			enablePanDownToClose
			enableDynamicSizing={false}
			backgroundStyle={{ backgroundColor: "#f9f9f9" }}
			onChange={(index) => {
				if (index === -1) {
					handlePanDownToClose("route");
					if (selectedRoute?.value.actual.active) {
						setActiveSheet("currentDispatch");
					}
				}
			}}
		>
			{selectedRoute && (
				<BottomSheetScrollView
					style={{
						flex: 1,
						padding: 10,
					}}
				>
					<RouteStopList />
				</BottomSheetScrollView>
			)}
		</BottomSheet>
	);
}
