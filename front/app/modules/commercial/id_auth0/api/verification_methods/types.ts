import 'api/verification_methods/types';
import { Multiloc } from 'typings';

declare module 'api/verification_methods/types' {
  export interface IVerificationMethodNamesMap {
    auth0: 'auth0';
  }

  export type IDAuth0Method = {
    id: string;
    type: 'verification_method';
    attributes: {
      name: 'auth0';
      method_name_multiloc: Multiloc;
    };
  };

  export interface IVerificationMethodMap {
    auth0: IDAuth0Method;
  }
}
