import React, { useState, useEffect } from 'react';
import { omit } from 'lodash-es';

// services
import {
  createReferenceDistribution,
  replaceReferenceDistribution,
  deleteReferenceDistribution,
  IReferenceDistributionData,
} from '../../services/referenceDistribution';

// hooks
import useUserCustomFieldOptions from 'modules/commercial/user_custom_fields/hooks/useUserCustomFieldOptions';
import useReferenceDistribution from '../../hooks/useReferenceDistribution';

// components
import { Accordion } from '@citizenlab/cl2-component-library';
import FieldTitle from './FieldTitle';
import FieldContent from './FieldContent';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import {
  getInitialValues,
  getSubmitAction,
  getStatus,
  parseFormValues,
} from './utils';

// typings
import { Multiloc } from 'typings';
import { IUserCustomFieldOptionData } from 'modules/commercial/user_custom_fields/services/userCustomFieldOptions';

interface Props {
  userCustomFieldId: string;
  titleMultiloc: Multiloc;
  isDefault: boolean;
  isComingSoon: boolean;
}

interface InnerProps extends Props {
  userCustomFieldOptions: IUserCustomFieldOptionData[];
  referenceDistribution: IReferenceDistributionData | NilOrError;
  referenceDataUploaded: boolean;
}

const StyledFieldTitle = styled(FieldTitle)`
  border-top: 1px solid ${colors.separation};
  border-bottom: 1px solid ${colors.separation};

  & + & {
    border-top: none;
  }
`;

const Field = ({
  userCustomFieldId,
  titleMultiloc,
  isDefault,
  isComingSoon,
  userCustomFieldOptions,
  referenceDistribution,
  referenceDataUploaded,
}: InnerProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);
  const [formValues, setFormValues] = useState(
    getInitialValues(
      userCustomFieldOptions,
      referenceDataUploaded,
      referenceDistribution
    )
  );

  useEffect(() => {
    if (formValues === null) {
      setFormValues(
        getInitialValues(
          userCustomFieldOptions,
          referenceDataUploaded,
          referenceDistribution
        )
      );
    }
  }, [
    formValues,
    userCustomFieldOptions,
    referenceDataUploaded,
    referenceDistribution,
  ]);

  if (formValues === null) return null;

  const onUpdateEnabled = (optionId: string, enabled: boolean) => {
    if (enabled) {
      setFormValues({
        ...formValues,
        [optionId]: null,
      });
    } else {
      setFormValues(omit(formValues, optionId));
    }

    setTouched(true);
  };

  const onUpdatePopulation = (optionId: string, population: number | null) => {
    setFormValues({
      ...formValues,
      [optionId]: population,
    });

    setTouched(true);
  };

  const onSubmit = async () => {
    setTouched(false);

    const submitAction = getSubmitAction(formValues, referenceDistribution);
    if (submitAction === null) return;

    const newDistribution = parseFormValues(formValues);
    if (newDistribution === null) return;

    setSubmitting(true);

    if (submitAction === 'create') {
      await createReferenceDistribution(userCustomFieldId, newDistribution);
    }

    if (submitAction === 'replace') {
      await replaceReferenceDistribution(userCustomFieldId, newDistribution);
    }

    if (submitAction === 'delete') {
      await deleteReferenceDistribution(userCustomFieldId);
    }

    setSubmitting(false);
  };

  const status = getStatus(formValues, referenceDistribution, touched);

  if (isComingSoon) {
    return (
      <StyledFieldTitle
        titleMultiloc={titleMultiloc}
        status={null}
        isDefault={false}
        isComingSoon
      />
    );
  }

  return (
    <Accordion
      title={
        <FieldTitle
          titleMultiloc={titleMultiloc}
          isDefault={isDefault}
          isComingSoon={false}
          status={status}
        />
      }
    >
      <FieldContent
        userCustomFieldId={userCustomFieldId}
        formValues={formValues}
        submitting={submitting}
        touched={touched}
        onUpdateEnabled={onUpdateEnabled}
        onUpdatePopulation={onUpdatePopulation}
        onSubmit={onSubmit}
      />
    </Accordion>
  );
};

const FieldWrapper = ({ userCustomFieldId, ...otherProps }: Props) => {
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
      {...otherProps}
      userCustomFieldOptions={userCustomFieldOptions}
      referenceDistribution={referenceDistribution}
      referenceDataUploaded={referenceDataUploaded}
    />
  );
};

export default FieldWrapper;
