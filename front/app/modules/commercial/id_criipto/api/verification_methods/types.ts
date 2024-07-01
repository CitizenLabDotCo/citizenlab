import 'api/verification_methods/types';

declare module 'api/verification_methods/types' {
  export interface IVerificationMethodNamesMap {
    criipto: 'criipto';
  }

  export type IDCriiptoMethod = {
    id: string;
    type: 'verification_method';
    attributes: {
      name: 'criipto';
      ui_method_name: string;
    };
  };

  export interface IVerificationMethodMap {
    criipto: IDCriiptoMethod;
  }
}
