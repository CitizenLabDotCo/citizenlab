import { IdMethodData, IdMethodName } from './types';

export function isLastIdMethod(
  idMethodName: IdMethodName,
  idMethods: IdMethodData[]
) {
  return (
    idMethods
      .map((vm) => vm.attributes.name)
      .indexOf(idMethodName) ===
    idMethods.length - 1
  );
}
