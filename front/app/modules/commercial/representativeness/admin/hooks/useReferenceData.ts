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

export interface RepresentativenessRow {
  name: string;
  key: string;
  title_multiloc: Multiloc;
  actualPercentage: number;
  referencePercentage: number;
  actualNumber: number;
  referenceNumber: number;
}

export type RepresentativenessData = RepresentativenessRow[];

const getStream = (code: TCustomFieldCode | null) => {
  if (code === null) return usersByRegFieldStream;
  if (code === 'gender') return usersByGenderStream;
  if (code === 'domicile') return usersByDomicileStream;
  return undefined;
};

function useReferenceData(field: IUserCustomFieldData, projectId?: string) {
  const [referenceData, setReferenceData] = useState<
    RepresentativenessData | NilOrError
  >();
  const [includedUserPercentage, setIncludedUserPercentage] = useState<
    number | NilOrError
  >();
  const [referenceDataUploaded, setReferenceDataUploaded] = useState<
    boolean | undefined
  >();

  const code = field.attributes.code;

  useEffect(() => {
    const stream = getStream(code);
    if (!stream) {
      setReferenceData(null);
      return;
    }

    const observable = stream(
      { queryParameters: { project: projectId } },
      field.id
    ).observable;

    const subscription = observable.subscribe(
      (usersByField: TStreamResponse | NilOrError) => {
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
      }
    );

    return () => subscription.unsubscribe();
  }, [code]);

  return {
    referenceData,
    includedUserPercentage,
    referenceDataUploaded,
  };
}

export default useReferenceData;

const toReferenceData = (usersByField: TStreamResponse): any => {
  const { users, expected_users } = usersByField.series;
  let data = Object.keys(users)
    .filter((opt) => opt !== '_blank')
    .map((opt) => ({
      key: opt,
      actualPercentage: Math.round(
        (users[opt] / Object.values(users).reduce((acc, v) => v + acc, 0)) * 100
      ),
      referencePercentage: Math.round(
        (expected_users[opt] /
          Object.values(expected_users).reduce((acc, v) => v + acc, 0)) *
          100
      ),
      actualNumber: users[opt],
      referenceNumber: expected_users[opt],
    }));
  if ('options' in usersByField) {
    const { options } = usersByField;
    data = data
      .sort((a, b) => options[a.key].ordering - options[b.key].ordering)
      .map((opt) => ({
        ...opt,
        title_multiloc: options[opt.key].title_multiloc,
      }));
  }
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
