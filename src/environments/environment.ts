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
  ACCESS_CODE: '',
  kendoLicenseKey: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkxJQyJ9.eyJwcm9kdWN0cyI6W3sidHJpYWwiOmZhbHNlLCJjb2RlIjoiS0VORE9VSVJFQUNUIiwibGljZW5zZUV4cGlyYXRpb25EYXRlIjoxNzU1OTQxNzUwfSx7InRyaWFsIjpmYWxzZSwiY29kZSI6IktFTkRPVUlDT01QTEVURSIsImxpY2Vuc2VFeHBpcmF0aW9uRGF0ZSI6MTc1NTk0MTc1MH0seyJ0cmlhbCI6ZmFsc2UsImNvZGUiOiJLRU5ET1VJVlVFIiwibGljZW5zZUV4cGlyYXRpb25EYXRlIjoxNzU1OTQxNzUwfSx7InRyaWFsIjpmYWxzZSwiY29kZSI6IktFTkRPVUlBTkdVTEFSIiwibGljZW5zZUV4cGlyYXRpb25EYXRlIjoxNzU1OTQxNzUwfV0sImludGVncml0eSI6IjhuNDdEXC9pcVR1TmcwZHI2dnNcL0tSNFdoZHpRPSIsImxpY2Vuc2VIb2xkZXIiOiJiYXRlYW1AaXNlbGFicy5jb20iLCJpYXQiOjE3MjQ0NDQ3ODAsImF1ZCI6ImJhdGVhbUBpc2VsYWJzLmNvbSIsInVzZXJJZCI6ImZmOTAzNWMwLWMyOTctNDZkNy04MGFmLWM3OTZjNzQ0OTgwMiJ9.zuXea79SA6RgPcElqYccXnTtHrqCohljkSceHqa2x3UhIgfGUeILcxSjU9fuExeSELodQqiM8-hR0AobxYoZH-VSdm9R1gOE07RXYnP8yb5HgdsgAJPGiTBLsaGZ9scurEXnmz_T6f0UO9xJIUd-gW2V2TrqZopqD-rB2QAOkLdvh-11hSmtb4BAC0_a2ccYtmojkdjNc23GRgG-kdLZ6Rj22YmAZkSsrCj8Hao03lgu1NKcmQ6SrVp9UvnCSXf22CpQLuQEJOQ0goPifBAGzOrI4OllKd3Nrec3H_iFVv-qpfiE2ZjvfSuTD5K_HrpmcS5ocY6IXo4LmsxDPjjqCQ'
};
