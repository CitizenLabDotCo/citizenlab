import { IdMethodData, IdMethodName } from './types';

export function isLastVerificationMethod(
  verificationMethodName: IdMethodName,
  verificationMethods: IdMethodData[]
) {
  return (
    verificationMethods
      .map((vm) => vm.attributes.name)
      .indexOf(verificationMethodName) ===
    verificationMethods.length - 1
  );
}
