// Extends app.json. google-services.json (Firebase config for Android push) is not
// in git, because the repository is public. On EAS Build it comes from the secret
// file variable GOOGLE_SERVICES_JSON; locally the file in this folder is used.
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? config.android.googleServicesFile,
  },
});
