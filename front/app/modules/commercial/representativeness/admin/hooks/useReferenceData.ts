import { useState, useEffect } from 'react';

// services
import {
  usersByRegFieldStream,
  usersByGenderStream,
  // usersByDomicileStream,
  TStreamResponse,
} from 'modules/commercial/user_custom_fields/services/stats';

// utils
import { zipObject } from 'lodash-es';
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { sum, roundPercentage, roundPercentages } from 'utils/math';

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

export interface IncludedUsers {
  known: number;
  total: number;
  percentage: number;
}

const getSubscription = (
  code: TCustomFieldCode | null,
  userCustomFieldId: string,
  projectId: string | undefined,
  handleStreamResponse: (usersByField: TStreamResponse) => void
) => {
  if (code === 'gender') {
    const observable = usersByGenderStream({
      queryParameters: { project: projectId },
    }).observable;

    const subscription = observable.subscribe(handleStreamResponse);
    return subscription;
  }

  // if (code === 'domicile') {
  //   const observable = usersByDomicileStream({
  //     queryParameters: { project: projectId },
  //   }).observable;

  //   const subscription = observable.subscribe(handleStreamResponse);
  //   return subscription;
  // }

  const observable = usersByRegFieldStream(
    { queryParameters: { project: projectId } },
    userCustomFieldId
  ).observable;

  const subscription = observable.subscribe(handleStreamResponse);
  return subscription;
};

function useReferenceData(
  userCustomField: IUserCustomFieldData,
  projectId?: string
) {
  const [referenceData, setReferenceData] = useState<
    RepresentativenessRowMultiloc[] | NilOrError
  >();
  const [includedUsers, setIncludedUsers] = useState<
    IncludedUsers | NilOrError
  >();
  const [referenceDataUploaded, setReferenceDataUploaded] = useState<
    boolean | undefined
  >();

  const code = userCustomField.attributes.code;
  const userCustomFieldId = userCustomField.id;

  useEffect(() => {
    const handleStreamResponse = (usersByField: TStreamResponse) => {
      if (isNilOrError(usersByField)) {
        setReferenceData(usersByField);
        setIncludedUsers(usersByField);
        return;
      }

      if (!usersByField.series.reference_population) {
        setReferenceDataUploaded(false);
        return;
      }

      const referenceData = toReferenceData(usersByField);
      const includedUsers = getIncludedUsers(usersByField);
      setReferenceData(referenceData);
      setIncludedUsers(includedUsers);
      setReferenceDataUploaded(true);
    };

    const subscription = getSubscription(
      code,
      userCustomFieldId,
      projectId,
      handleStreamResponse
    );

    if (subscription) {
      return () => subscription.unsubscribe();
    }

    return;
  }, [code, userCustomFieldId, projectId]);

  return {
    referenceData,
    includedUsers,
    referenceDataUploaded,
  };
}

export default useReferenceData;

export const toReferenceData = (
  usersByField: TStreamResponse
): RepresentativenessRowMultiloc[] => {
  const { users, reference_population } = usersByField.series;

  const optionIds = Object.keys(reference_population);
  const includedUsers = syncKeys(users, optionIds);

  // const options =
  //   'options' in usersByField ? usersByField.options : usersByField.areas;
  const options = usersByField.options;

  const actualPercentages = roundPercentages(Object.values(includedUsers), 1);
  const referencePercentages = roundPercentages(
    Object.values(reference_population),
    1
  );

  const actualPercentagesObj = zipObject(optionIds, actualPercentages);
  const referencePercentagesObj = zipObject(optionIds, referencePercentages);

  const sortedOptionIds = [...optionIds].sort(
    (a, b) => options[a].ordering - options[b].ordering
  );

  const data = sortedOptionIds.map((optionId) => ({
    title_multiloc: options[optionId].title_multiloc,
    actualPercentage: actualPercentagesObj[optionId],
    referencePercentage: referencePercentagesObj[optionId],
    actualNumber: includedUsers[optionId],
    referenceNumber: reference_population[optionId],
  }));

  return data;
};

// Makes sure that users has the same keys as reference_population
const syncKeys = (users: Record<string, number>, keys: string[]) => {
  const fixedUsers = {};

  keys.forEach((key) => {
    fixedUsers[key] = users[key] ?? 0;
  });

  return fixedUsers;
};

export const getIncludedUsers = (
  usersByField: TStreamResponse
): IncludedUsers => {
  const { users, reference_population } = usersByField.series;
  const includedUsers = syncKeys(users, [
    ...Object.keys(reference_population),
    '_blank',
  ]);

  const known = Object.keys(includedUsers)
    .filter((optionId) => optionId !== '_blank')
    .reduce((acc, v) => users[v] + acc, 0);

  const total = sum(Object.values(includedUsers));
  const percentage = total === 0 ? 0 : roundPercentage(known, total);

  return {
    known,
    total,
    percentage,
  };
};
