export interface TriggerResetPasswordProperties {
  user: {
    email: string;
  };
}

export interface ResetPasswordProperties {
  user: {
    password: string;
    token: string;
  };
}
