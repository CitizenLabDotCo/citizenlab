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
import useUserCustomField from 'modules/commercial/user_custom_fields/hooks/useUserCustomField';

// components
import { Accordion, ListItem } from '@citizenlab/cl2-component-library';
import FieldTitle from './FieldTitle';
import FieldContent from './FieldContent';

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

  // TODO remove
  const userCustomField = useUserCustomField(userCustomFieldId);

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

  // TODO remove
  if (isNilOrError(userCustomField)) {
    return null;
  }

  // TODO derive this from reference distribution or whatever
  const AGE_GROUPS_SET =
    userCustomField.attributes.key === 'birthyear' ? false : undefined;

  const status = getStatus(
    formValues,
    referenceDistribution,
    touched,
    AGE_GROUPS_SET
  );

  if (isComingSoon) {
    return (
      <ListItem>
        <FieldTitle
          titleMultiloc={titleMultiloc}
          status={null}
          isDefault={false}
          isComingSoon
        />
      </ListItem>
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
        ageGroupsSet={AGE_GROUPS_SET}
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
