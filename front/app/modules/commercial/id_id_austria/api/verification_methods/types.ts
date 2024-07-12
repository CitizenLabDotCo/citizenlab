import 'api/verification_methods/types';
import { Multiloc } from 'typings';

declare module 'api/verification_methods/types' {
  export interface IVerificationMethodNamesMap {
    id_austria: 'id_austria';
  }

  export type IDIdAustriaMethod = {
    id: string;
    type: 'verification_method';
    attributes: {
      name: 'id_austria';
      method_name_multiloc: Multiloc;
    };
  };

  export interface IVerificationMethodMap {
    id_austria: IDIdAustriaMethod;
  }
}
