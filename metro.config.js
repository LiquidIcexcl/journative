const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname)

// // 强制重定向 PlatformConstants 引用
// config.resolver.extraNodeModules = {
//     ...config.resolver.extraNodeModules,
//     'react-native/Libraries/Utilities/PlatformConstants': require.resolve(
//       './platform-constants-shim.js'
//     ),
//   };

module.exports = withNativeWind(config, { input: './global.css' })