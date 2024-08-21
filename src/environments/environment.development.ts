export const environment = {
  msalConfig: {
    auth: {
      clientId: "0addb380-e2a1-46ec-8197-d93a34f13a10", // Application (client) ID from the app registration
      authority: "https://login.microsoftonline.com/cc04fc65-6f74-4864-90c9-f9aa6354d17b", // The Azure cloud instance and the app's sign-in audience (tenant ID, common, organizations, or consumers)
      redirectUri: "/"
    }
  },
  apiConfig: {
    scopes: ['user.read'],
    uri: 'ENTER_URI'
  },
  apiUrl: 'https://localhost:44303/api/'
};
