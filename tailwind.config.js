const colors = require("./colors");

module.exports = {
	content: ["./app/**/*.tsx", "./components/**/*.tsx"],
	theme: {
		extend: {
			colors: colors,
		},
	},
	plugins: [],
	corePlugins: require("tailwind-rn/unsupported-core-plugins"),
};
