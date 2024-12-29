import { useOrder } from "@/providers/OrderProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import OrderList from "./OrderList";
export default function RouteSheet() {
	const { orders }: any = useOrder();
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
			{orders && orders.length > 0 && (
				<BottomSheetScrollView
					style={{
						flex: 1,
						padding: 10,
					}}
				>
					<OrderList />
				</BottomSheetScrollView>
			)}
		</BottomSheet>
	);
}
