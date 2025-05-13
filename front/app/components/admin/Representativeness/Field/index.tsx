import React, { useState, useEffect } from 'react';

import { Accordion, ListItem } from '@citizenlab/cl2-component-library';
import { omit } from 'lodash-es';

import useCustomFieldOptions from 'api/custom_field_options/useCustomFieldOptions';
import {
  TReferenceDistributionData,
  Bins,
  TAddDistribution,
} from 'api/reference_distribution/types';
import useAddReferenceDistribution from 'api/reference_distribution/useAddReferenceDistribution';
import useDeleteReferenceDistribution from 'api/reference_distribution/useDeleteReferenceDistribution';
import useReferenceDistributionData, {
  RemoteFormValues,
} from 'api/reference_distribution/useReferenceDistributionData';
import useUserCustomField from 'api/user_custom_fields/useUserCustomField';

import { isSupported } from 'containers/Admin/Representativeness/Dashboard/utils';

import { isNilOrError, NilOrError } from 'utils/helperUtils';
import {
  getStatus,
  convertBinsToFormValues,
  getSubmitAction,
  parseFormValues,
  getInitialValues,
  FormValues,
} from 'utils/representativeness/form';

import FieldContent from './FieldContent';
import FieldTitle from './FieldTitle';

interface Props {
  userCustomFieldId: string;
}

interface InnerProps extends Props {
  referenceDistribution: TReferenceDistributionData | NilOrError;
  remoteFormValues?: RemoteFormValues;
  initialValues: FormValues | null;
}

const Field = ({
  userCustomFieldId,
  referenceDistribution,
  remoteFormValues,
  initialValues,
}: InnerProps) => {
  const { mutateAsync: deleteReferenceDistribution } =
    useDeleteReferenceDistribution();
  const { mutateAsync: createReferenceDistribution } =
    useAddReferenceDistribution();
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const isBinnedDistribution =
    !isNilOrError(referenceDistribution) &&
    referenceDistribution.type === 'binned_distribution';

  const [bins, setBins] = useState<Bins | undefined>(
    isBinnedDistribution
      ? referenceDistribution.attributes.distribution.bins
      : undefined
  );

  const [formValues, setFormValues] = useState<FormValues | null>(
    initialValues
  );

  const { data: userCustomField } = useUserCustomField(userCustomFieldId);

  useEffect(() => {
    if (isBinnedDistribution && !bins) {
      setBins(referenceDistribution.attributes.distribution.bins);
    }
  }, [isBinnedDistribution, bins, referenceDistribution]);

  if (formValues === null || !userCustomField) {
    return null;
  }

  const isComingSoon = !isSupported(userCustomField.data);
  const isDefault = userCustomField.data.attributes.code !== null;
  const isBirthyear = userCustomField.data.attributes.key === 'birthyear';
  const titleMultiloc = userCustomField.data.attributes.title_multiloc;

  const binsSet = isBirthyear ? !!bins : undefined;
  const status = getStatus(formValues, remoteFormValues, touched, binsSet);

  const handleUpdateEnabled = (optionId: string, enabled: boolean) => {
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

  const handleUpdatePopulation = (
    optionId: string,
    population: number | null
  ) => {
    setFormValues({
      ...formValues,
      [optionId]: population,
    });

    setTouched(true);
  };

  const handleSaveBins = (bins: Bins) => {
    setBins(bins);
    setFormValues(convertBinsToFormValues(bins, formValues));
  };

  const handleSubmit = async () => {
    setTouched(false);

    const submitAction = getSubmitAction(formValues, remoteFormValues);
    if (submitAction === null) return;

    const newDistribution = parseFormValues(formValues, bins);
    if (newDistribution === null) return;

    setSubmitting(true);

    if (submitAction === 'create' || submitAction === 'replace') {
      await createReferenceDistribution({
        id: userCustomField.data.id,
        ...newDistribution,
      } as TAddDistribution);
    }

    if (submitAction === 'delete') {
      await deleteReferenceDistribution(userCustomField.data.id);
    }

    setSubmitting(false);
  };

  if (isComingSoon) {
    return (
      <ListItem>
        <FieldTitle
          titleMultiloc={titleMultiloc}
          isDefault={false}
          isComingSoon
          isBirthyear={isBirthyear}
          status={null}
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
          isBirthyear={isBirthyear}
          status={status}
        />
      }
    >
      <FieldContent
        userCustomFieldId={userCustomFieldId}
        formValues={formValues}
        bins={bins}
        submitting={submitting}
        touched={touched}
        binsSet={binsSet}
        onUpdateEnabled={handleUpdateEnabled}
        onUpdatePopulation={handleUpdatePopulation}
        onSaveBins={handleSaveBins}
        onSubmit={handleSubmit}
      />
    </Accordion>
  );
};

const FieldWrapper = ({ userCustomFieldId }: Props) => {
  const { data: userCustomFieldOptions } =
    useCustomFieldOptions(userCustomFieldId);
  const { referenceDistribution, referenceDataUploaded, remoteFormValues } =
    useReferenceDistributionData(userCustomFieldId);

  if (
    isNilOrError(userCustomFieldOptions) ||
    referenceDataUploaded === undefined
  ) {
    return null;
  }

  const initialValues = getInitialValues(
    userCustomFieldOptions.data,
    referenceDataUploaded,
    remoteFormValues
  );

  return (
    <Field
      userCustomFieldId={userCustomFieldId}
      referenceDistribution={referenceDistribution}
      remoteFormValues={remoteFormValues}
      initialValues={initialValues}
    />
  );
};

export default FieldWrapper;
