import { useDispatch } from "@/providers/DispatchProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import DispatchList from "./DispatchList";

export default function RouteSheet() {
	const { dispatches }: any = useDispatch();
	const { bottomSheetRefs, handlePanDownToClose } = useSheetContext();

	return (
		<BottomSheet
			ref={bottomSheetRefs.route}
			index={-1}
			snapPoints={["70%"]}
			enablePanDownToClose
			enableDynamicSizing={false}
			backgroundStyle={{ backgroundColor: "#f9f9f9" }}
			onClose={() => handlePanDownToClose("route")}
		>
			{dispatches && dispatches.length > 0 && (
				<BottomSheetScrollView
					style={{
						flex: 1,
						padding: 10,
					}}
				>
					<DispatchList />
				</BottomSheetScrollView>
			)}
		</BottomSheet>
	);
}
