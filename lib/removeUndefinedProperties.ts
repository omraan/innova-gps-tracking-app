export function removeUndefinedProperties(obj: any) {
	return Object.entries(obj).reduce((a, [k, v]) => (v === undefined ? a : { ...a, [k]: v }), {});
}
