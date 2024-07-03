import { Picker } from "@react-native-picker/picker";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Icon } from "@rneui/themed";
import { ref, update } from "firebase/database";
import React, { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useTailwind } from "tailwind-rn";
import { db } from "../../firebase";
import { useOrganisationStore } from "../../hooks/stores/organisationStore";
import { useUserStore } from "../../hooks/stores/userStore";
import { pickerSelectStyles } from "../../lib/styles";
import { RootStackParamList } from "../../navigator/RootNavigator";
import { TabStackParamList } from "../../navigator/TabNavigator";

type OrganisationScreenNavigationProp = CompositeNavigationProp<
	BottomTabNavigationProp<TabStackParamList>,
	NativeStackNavigationProp<RootStackParamList, "Settings">
>;

const OrganisationScreen = () => {
	const tw = useTailwind();
	const navigation = useNavigation<OrganisationScreenNavigationProp>();
	const { organisations } = useOrganisationStore();
	const { selectedUser, setSelectedUser } = useUserStore();

	const [loading, setLoading] = useState(true);
	useEffect(() => {
		if (organisations.length > 0) {
			setLoading(false);
		}
	}, [organisations, selectedUser]);

	const handleValueChange = (itemValue: string) => {
		if (selectedUser && selectedUser.id) {
			const userRef = update(ref(db, `users/${selectedUser.id}`), { selectedOrganisationId: itemValue });
			setSelectedUser({
				...selectedUser,
				selectedOrganisationId: itemValue,
			});
		}
	};
	const inputRef = useRef(null);

	return (
		<View>
			{loading ? (
				<Text>Loading...</Text>
			) : (
				<View style={tw("px-5 bg-white h-full ")}>
					<Text style={tw("text-sm  py-5 text-gray-700")}>Preferred Organisation</Text>
					<View style={tw("relative")}>
						<RNPickerSelect
							onValueChange={handleValueChange}
							items={organisations.map((organisation) => ({
								label: organisation.name,
								value: organisation.id,
							}))}
							style={{ ...pickerSelectStyles }}
							value={organisations.find((org) => org.id === selectedUser?.selectedOrganisationId)?.id}
						/>
						{/* <View style={[tw("absolute"), { zIndex: 10, top: "25%", right: 20 }]}>
							<Icon name="chevron-down" type="feather" size={20} color="gray" />
						</View> */}
					</View>
				</View>
			)}
		</View>
	);
};

export default OrganisationScreen;
