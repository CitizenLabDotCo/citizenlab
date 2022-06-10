import { useState, useEffect } from 'react';

// services
import {
  usersByRegFieldStream,
  usersByGenderStream,
  usersByDomicileStream,
  TStreamResponse,
} from 'modules/commercial/user_custom_fields/services/stats';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import {
  IUserCustomFieldData,
  TCustomFieldCode,
} from 'modules/commercial/user_custom_fields/services/userCustomFields';
import { Multiloc } from 'typings';

interface RepresentativenessRowBase {
  actualPercentage: number;
  referencePercentage: number;
  actualNumber: number;
  referenceNumber: number;
}
export interface RepresentativenessRow extends RepresentativenessRowBase {
  name: string;
}

export interface RepresentativenessRowMultiloc
  extends RepresentativenessRowBase {
  title_multiloc: Multiloc;
}

export type RepresentativenessData = RepresentativenessRow[];

const getSubscription = (
  code: TCustomFieldCode | null,
  fieldId: string,
  projectId: string | undefined,
  handleStreamResponse: (usersByField: TStreamResponse) => void
) => {
  if (code === null) {
    const observable = usersByRegFieldStream(
      { queryParameters: { project: projectId } },
      fieldId
    ).observable;

    const subscription = observable.subscribe(handleStreamResponse);
    return subscription;
  }

  if (code === 'gender') {
    const observable = usersByGenderStream({
      queryParameters: { project: projectId },
    }).observable;

    const subscription = observable.subscribe(handleStreamResponse);
    return subscription;
  }

  if (code === 'domicile') {
    const observable = usersByDomicileStream({
      queryParameters: { project: projectId },
    }).observable;

    const subscription = observable.subscribe(handleStreamResponse);
    return subscription;
  }

  return;
};

function useReferenceData(field: IUserCustomFieldData, projectId?: string) {
  const [referenceData, setReferenceData] = useState<
    RepresentativenessRowMultiloc[] | NilOrError
  >();
  const [includedUserPercentage, setIncludedUserPercentage] = useState<
    number | NilOrError
  >();
  const [referenceDataUploaded, setReferenceDataUploaded] = useState<
    boolean | undefined
  >();

  const code = field.attributes.code;
  const fieldId = field.id;

  useEffect(() => {
    const handleStreamResponse = (usersByField: TStreamResponse) => {
      if (isNilOrError(usersByField)) {
        setReferenceData(usersByField);
        setIncludedUserPercentage(usersByField);
        return;
      }

      if (!usersByField.series.expected_users) {
        setReferenceDataUploaded(false);
        return;
      }

      const referenceData = toReferenceData(usersByField);
      const includedUsersPercentage = getIncludedUserPercentage(usersByField);
      setReferenceData(referenceData);
      setIncludedUserPercentage(includedUsersPercentage);
      setReferenceDataUploaded(true);
    };

    const subscription = getSubscription(
      code,
      fieldId,
      projectId,
      handleStreamResponse
    );

    if (subscription) {
      return () => subscription.unsubscribe();
    }

    return;
  }, [code, fieldId, projectId]);

  return {
    referenceData,
    includedUserPercentage,
    referenceDataUploaded,
  };
}

export default useReferenceData;

const toReferenceData = (
  usersByField: TStreamResponse
): RepresentativenessRowMultiloc[] => {
  const { users, expected_users } = usersByField.series;
  const options =
    'options' in usersByField ? usersByField.options : usersByField.areas;
  const totalActualUsers = Object.values(users).reduce((acc, v) => v + acc, 0);
  const totalReferenceUsers = Object.values(expected_users).reduce(
    (acc, v) => v + acc,
    0
  );
  const data = Object.keys(users)
    .filter((opt) => opt !== '_blank')
    .map((opt) => ({
      title_multiloc: options[opt].title_multiloc,
      actualPercentage: Math.round((users[opt] / totalReferenceUsers) * 100),
      referencePercentage: Math.round(
        (expected_users[opt] / totalActualUsers) * 100
      ),
      actualNumber: users[opt],
      referenceNumber: expected_users[opt],
    }));

  return data;
};

const getIncludedUserPercentage = (usersByField: TStreamResponse): number => {
  const { users } = usersByField.series;
  const known = Object.keys(users)
    .filter((opt) => opt !== '_blank')
    .reduce((acc, v) => users[v] + acc, 0);
  const total = Object.values(users).reduce((v, acc) => v + acc, 0);
  return Math.round((known / total) * 100);
};
