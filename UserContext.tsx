import React from "react";

type UserContextType = {
	userId: null | string;
	setUserId: React.Dispatch<React.SetStateAction<null | string>>;
};

const UserContext = React.createContext<UserContextType | null>(null);

export default UserContext;
