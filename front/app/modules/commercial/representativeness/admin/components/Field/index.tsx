import React, { useState } from 'react';

// hooks
import useUserCustomFieldOptions from 'modules/commercial/user_custom_fields/hooks/useUserCustomFieldOptions';
import useReferenceDistribution from '../../hooks/useReferenceDistribution';

// components
import { Accordion } from '@citizenlab/cl2-component-library';
import FieldTitle from './FieldTitle';
import FieldContent from './FieldContent';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { getInitialValues, allowSubmit } from './utils';

// typings
import { Multiloc } from 'typings';
import { IUserCustomFieldOptionData } from 'modules/commercial/user_custom_fields/services/userCustomFieldOptions';
import { IReferenceDistributionData } from '../../services/referenceDistribution';

interface Props {
  userCustomFieldId: string;
  titleMultiloc: Multiloc;
  isDefault: boolean;
}

interface InnerProps extends Props {
  userCustomFieldOptions: IUserCustomFieldOptionData[];
  referenceDistribution: IReferenceDistributionData | NilOrError;
  referenceDataUploaded: boolean;
}

const Field = ({
  userCustomFieldId,
  titleMultiloc,
  isDefault,
  userCustomFieldOptions,
  referenceDistribution,
  referenceDataUploaded,
}: InnerProps) => {
  const [formValues, setFormValues] = useState(
    getInitialValues(
      userCustomFieldOptions,
      referenceDataUploaded,
      referenceDistribution
    )
  );

  if (formValues === null) return null;

  setFormValues;

  return (
    <Accordion
      title={<FieldTitle titleMultiloc={titleMultiloc} isDefault={isDefault} />}
    >
      <FieldContent
        userCustomFieldId={userCustomFieldId}
        allowSubmit={allowSubmit(formValues)}
      />
    </Accordion>
  );
};

const FieldWrapper = ({
  userCustomFieldId,
  titleMultiloc,
  isDefault,
}: Props) => {
  const userCustomFieldOptions = useUserCustomFieldOptions(userCustomFieldId);
  const { referenceDistribution, referenceDataUploaded } =
    useReferenceDistribution(userCustomFieldId);

  if (
    isNilOrError(userCustomFieldOptions) ||
    referenceDataUploaded === undefined
  ) {
    return null;
  }

  return (
    <Field
      userCustomFieldId={userCustomFieldId}
      titleMultiloc={titleMultiloc}
      isDefault={isDefault}
      userCustomFieldOptions={userCustomFieldOptions}
      referenceDistribution={referenceDistribution}
      referenceDataUploaded={referenceDataUploaded}
    />
  );
};

export default FieldWrapper;
