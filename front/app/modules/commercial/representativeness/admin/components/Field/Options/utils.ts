// typings
import { IUserCustomFieldOptionData } from 'modules/commercial/user_custom_fields/services/userCustomFieldOptions';
import { IReferenceDistributionData } from '../../../services/referenceDistribution';
import { FormValues } from './';

export function getInitialValues(
  customFieldsOptions: IUserCustomFieldOptionData[],
  referenceDistribution: IReferenceDistributionData
): FormValues {
  console.log(customFieldsOptions);
  console.log(referenceDistribution);
  return {};
}
