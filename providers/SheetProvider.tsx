import BottomSheet from "@gorhom/bottom-sheet";
import React, { act, createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from "react";

type SheetCategories = "orders" | "route" | "metadata" | "settings";

interface SheetContextProps {
	activeSheet: SheetCategories | null;
	setActiveSheet: (sheet: SheetCategories | null) => void;
	bottomSheetRefs: {
		orders: React.RefObject<BottomSheet>;
		route: React.RefObject<BottomSheet>;
		metadata: React.RefObject<BottomSheet>;
		settings: React.RefObject<BottomSheet>;
	};
	handlePanDownToClose: (sheet: SheetCategories) => void;
}

const SheetContext = createContext<SheetContextProps | null>(null);

export const SheetProvider = ({ children }: PropsWithChildren) => {
	const [activeSheet, setActiveSheet] = useState<SheetCategories | null>(null);

	const bottomSheetRefs = {
		orders: useRef<BottomSheet>(null),
		route: useRef<BottomSheet>(null),
		metadata: useRef<BottomSheet>(null),
		settings: useRef<BottomSheet>(null),
	};

	const handleSetActiveSheet = (sheet: SheetCategories | null) => {
		if (sheet === activeSheet) {
			if (activeSheet !== "orders") {
				setActiveSheet(null);
			} else {
				bottomSheetRefs.orders.current?.close();
				setTimeout(() => {
					bottomSheetRefs.orders.current?.expand();
				}, 100);
			}
		} else {
			setActiveSheet(sheet);
		}
	};

	const handlePanDownToClose = (sheet: SheetCategories) => {
		if (activeSheet === sheet) {
			bottomSheetRefs[sheet].current?.close();
			setActiveSheet(null);
		}
	};

	useEffect(() => {
		if (activeSheet) {
			bottomSheetRefs[activeSheet].current?.expand();
		}
		Object.keys(bottomSheetRefs).forEach((key) => {
			if (key !== activeSheet) {
				bottomSheetRefs[key as SheetCategories].current?.close();
			}
		});
	}, [activeSheet]);

	return (
		<SheetContext.Provider
			value={{ activeSheet, setActiveSheet: handleSetActiveSheet, bottomSheetRefs, handlePanDownToClose }}
		>
			{children}
		</SheetContext.Provider>
	);
};

export const useSheetContext = () => {
	const context = useContext(SheetContext);
	if (!context) {
		throw new Error("useSheetContext must be used within a SheetProvider");
	}
	return context;
};