import BottomSheet from "@gorhom/bottom-sheet";
import React, { act, createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from "react";

type SheetCategories = "dispatches" | "route" | "metadata" | "settings" | "account" | "currentDispatch";

interface SheetContextProps {
	activeSheet: SheetCategories | null;
	setActiveSheet: (sheet: SheetCategories | null) => void;
	bottomSheetRefs: {
		dispatches: React.RefObject<BottomSheet>;
		route: React.RefObject<BottomSheet>;
		metadata: React.RefObject<BottomSheet>;
		settings: React.RefObject<BottomSheet>;
		account: React.RefObject<BottomSheet>;
		currentDispatch: React.RefObject<BottomSheet>;
	};
	handlePanDownToClose: (sheet: SheetCategories) => void;
}

const SheetContext = createContext<SheetContextProps | null>(null);

export const SheetProvider = ({ children }: PropsWithChildren) => {
	const [activeSheet, setActiveSheet] = useState<SheetCategories | null>("currentDispatch");

	const bottomSheetRefs = {
		dispatches: useRef<BottomSheet>(null),
		route: useRef<BottomSheet>(null),
		metadata: useRef<BottomSheet>(null),
		settings: useRef<BottomSheet>(null),
		account: useRef<BottomSheet>(null),
		currentDispatch: useRef<BottomSheet>(null),
	};

	const handleSetActiveSheet = (sheet: SheetCategories | null) => {
		// console.log("handleActiveSheet", sheet, activeSheet);
		if (sheet === activeSheet) {
			if (activeSheet !== "dispatches") {
				setActiveSheet(null);
			} else {
				bottomSheetRefs.dispatches.current?.close();
				setTimeout(() => {
					bottomSheetRefs.dispatches.current?.expand();
				}, 200);
			}
			setActiveSheet("currentDispatch");
		} else {
			setActiveSheet(sheet);
		}
	};

	const handlePanDownToClose = (sheet: SheetCategories) => {
		if (activeSheet === sheet) {
			bottomSheetRefs[sheet].current?.close();
			setActiveSheet("currentDispatch");
		}
	};

	useEffect(() => {
		if (activeSheet) {
			setTimeout(() => {
				bottomSheetRefs[activeSheet].current?.expand();
			}, 200);
		}
		Object.keys(bottomSheetRefs).forEach((key) => {
			if (key !== activeSheet) {
				bottomSheetRefs[key as SheetCategories].current?.close();
			}
		});
	}, [activeSheet, bottomSheetRefs]);

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
