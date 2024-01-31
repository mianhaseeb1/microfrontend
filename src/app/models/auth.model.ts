export interface Auth {
  isAuthenticated: boolean;
}

export interface AuthCallbackResponse {
  data: {
    accessToken: string;
    userInfo: {
      name: string;
      emails: string[];
    };
  };
}
