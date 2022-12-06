import React, { useState, useEffect } from 'react';
// components
import { Accordion, ListItem } from '@citizenlab/cl2-component-library';
import { omit } from 'lodash-es';
import useReferenceDistribution, {
  RemoteFormValues,
} from '../../hooks/useReferenceDistribution';
import useUserCustomField from 'hooks/useUserCustomField';
// hooks
import useUserCustomFieldOptions from 'hooks/useUserCustomFieldOptions';
// services
import {
  createReferenceDistribution,
  replaceReferenceDistribution,
  deleteReferenceDistribution,
  Bins,
  TReferenceDistributionData,
} from '../../services/referenceDistribution';
// typings
import { IUserCustomFieldOptionData } from 'services/userCustomFieldOptions';
import { isSupported } from '../../containers/Dashboard/utils';
import {
  getInitialValues,
  getSubmitAction,
  getStatus,
  parseFormValues,
  convertBinsToFormValues,
} from '../../utils/form';
// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import FieldContent from './FieldContent';
import FieldTitle from './FieldTitle';

interface Props {
  userCustomFieldId: string;
}

interface InnerProps extends Props {
  userCustomFieldOptions: IUserCustomFieldOptionData[];
  referenceDistribution: TReferenceDistributionData | NilOrError;
  remoteFormValues?: RemoteFormValues;
  referenceDataUploaded: boolean;
}

const Field = ({
  userCustomFieldId,
  userCustomFieldOptions,
  referenceDistribution,
  referenceDataUploaded,
  remoteFormValues,
}: InnerProps) => {
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

  const [formValues, setFormValues] = useState(
    getInitialValues(
      userCustomFieldOptions,
      referenceDataUploaded,
      remoteFormValues
    )
  );

  const userCustomField = useUserCustomField(userCustomFieldId);

  useEffect(() => {
    if (isBinnedDistribution && !bins) {
      setBins(referenceDistribution.attributes.distribution.bins);
    }
  }, [isBinnedDistribution, bins, referenceDistribution]);

  useEffect(() => {
    if (formValues === null) {
      setFormValues(
        getInitialValues(
          userCustomFieldOptions,
          referenceDataUploaded,
          remoteFormValues
        )
      );
    }
  }, [
    formValues,
    userCustomFieldOptions,
    referenceDataUploaded,
    remoteFormValues,
  ]);

  if (formValues === null || isNilOrError(userCustomField)) {
    return null;
  }

  const isComingSoon = !isSupported(userCustomField);
  const isDefault = userCustomField.attributes.code !== null;
  const isBirthyear = userCustomField.attributes.key === 'birthyear';
  const titleMultiloc = userCustomField.attributes.title_multiloc;

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

    if (submitAction === 'create') {
      await createReferenceDistribution(userCustomField, newDistribution);
    }

    if (submitAction === 'replace') {
      await replaceReferenceDistribution(userCustomField, newDistribution);
    }

    if (submitAction === 'delete') {
      await deleteReferenceDistribution(userCustomField);
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
  const userCustomFieldOptions = useUserCustomFieldOptions(userCustomFieldId);
  const { referenceDistribution, referenceDataUploaded, remoteFormValues } =
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
      userCustomFieldOptions={userCustomFieldOptions}
      referenceDistribution={referenceDistribution}
      referenceDataUploaded={referenceDataUploaded}
      remoteFormValues={remoteFormValues}
    />
  );
};

export default FieldWrapper;
