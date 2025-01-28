export function removeTypenameProperties(obj: any): any {
	if (Array.isArray(obj)) {
		return obj.map(removeTypenameProperties);
	} else if (obj !== null && typeof obj === "object") {
		const newObj: any = {};
		for (const key in obj) {
			if (key !== "__typename") {
				newObj[key] = removeTypenameProperties(obj[key]);
			}
		}
		return newObj;
	}
	return obj;
}
