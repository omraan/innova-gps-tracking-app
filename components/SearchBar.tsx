import { useDispatch } from "@/providers/DispatchProvider";
import React, { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

const SearchBar = () => {
	const { setSearchQuery } = useDispatch();
	const [query, setQuery] = useState("");

	const handleSearch = (text: string) => {
		setQuery(text);
		setSearchQuery(text);
	};

	return (
		<View className="flex-1">
			<TextInput
				className="bg-white px-8 py-3 rounded-full text-2xl shadow shadow-black/20"
				placeholder="Search..."
				value={query}
				onChangeText={handleSearch}
			/>
		</View>
	);
};

export default SearchBar;
