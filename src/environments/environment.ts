export const environment = {
  msalConfig: {
    auth: {
      clientId: "", // Application (client) ID from the app registration
      authority: "", // The Azure cloud instance and the app's sign-in audience (tenant ID, common, organizations, or consumers)
      redirectUri: "/",
    }
  },
  apiConfig: {
    scopes: ['user.read'],
    uri: 'ENTER_URI'
  },
  apiUrl : 'https://localhost:44303/api/'
};
