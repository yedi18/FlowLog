// metro.config.js
// הגדרות Metro bundler לFirebase

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// הוספת תמיכה ב-Firebase
config.resolver.assetExts.push(
  // Firebase
  'db',
  'mp3',
  'ttf',
  'obj',
  'png',
  'jpg'
);

// פתרון בעיות עם Node.js modules
config.resolver.alias = {
  crypto: 'react-native-crypto',
};

module.exports = config;