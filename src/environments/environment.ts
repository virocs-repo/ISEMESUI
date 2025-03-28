export const environment = {
  msalConfig: {
    auth: {
      clientId: "ebddece1-c584-4f09-81f4-56bbf059f4cb", // Replace with your actual Azure AD Application (client) ID
      authority: "https://login.microsoftonline.com/b7066282-ee4d-4f53-a68a-e274fb51a9c1", // Replace with your Azure AD tenant ID or "common" for multi-tenant apps
      
      redirectUri: "/",
    }
  },
  apiConfig: {
    scopes: ['user.read'],
    uri: 'https://graph.microsoft.com/v1.0/me'
  },
  apiUrl : 'https://ise-inventoryapi.azurewebsites.net/api/',
  ACCESS_CODE: ''
};
