const colors = require("./colors");

module.exports = {
	content: ["./**/*.tsx"],
	theme: {
		extend: {
			colors: colors,
		},
	},
	plugins: [],
	corePlugins: require("tailwind-rn/unsupported-core-plugins"),
};
