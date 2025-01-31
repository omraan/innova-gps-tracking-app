import { UPDATE_ROUTE_END_TIME } from "@/graphql/mutations";
import { useDateStore } from "@/hooks/useDateStore";
import { useRouteSessionStore } from "@/hooks/useRouteSessionStore";
import { useDispatch } from "@/providers/DispatchProvider";
import { useRoute } from "@/providers/RouteProvider";
import { useSheetContext } from "@/providers/SheetProvider";
import { useMutation } from "@apollo/client";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import moment from "moment";
import { Text, TouchableOpacity, View } from "react-native";
import DispatchList from "./DispatchList";
import { ModalPicker } from "./ModalPicker";

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
