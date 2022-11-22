import {
  TVerificationMethod,
  TVerificationMethodName,
} from 'services/verificationMethods';

export function isLastVerificationMethod(
  verificationMethodName: TVerificationMethodName,
  verificationMethods: TVerificationMethod[]
) {
  return (
    verificationMethods
      .map((vm) => vm.attributes.name)
      .indexOf(verificationMethodName) ===
    verificationMethods.length - 1
  );
}
