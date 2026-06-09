import { TVerificationMethod, IdMethodName } from './types';

export function isLastVerificationMethod(
  verificationMethodName: IdMethodName,
  verificationMethods: TVerificationMethod[]
) {
  return (
    verificationMethods
      .map((vm) => vm.attributes.name)
      .indexOf(verificationMethodName) ===
    verificationMethods.length - 1
  );
}
