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

// // Add additional resolver for React Native
// config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];
// config.resolver.extraNodeModules = {
//   ...config.resolver.extraNodeModules,
//   'react-native': require.resolve('react-native'),
// };

// // Add support for Hermes
// config.transformer.unstable_allowRequireContext = true;

module.exports = withNativeWind(config, { input: './global.css' });
 