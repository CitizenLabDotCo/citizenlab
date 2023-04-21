export interface UserCheckResponse {
  data: {
    type: 'check';
    attributes: {
      action: Action;
    };
  };
}

type Action = 'password' | 'confirm' | 'terms';
