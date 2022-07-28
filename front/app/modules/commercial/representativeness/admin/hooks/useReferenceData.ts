import { useState, useEffect } from 'react';

// services
import {
  usersByRegFieldStream,
  usersByGenderStream,
  usersByBirthyearStream,
  // usersByDomicileStream,
  TStreamResponse,
  TOptions,
  IUsersByRegistrationField,
  // IUsersByBirthyear
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

  if (code === 'birthyear') {
    const observable = usersByBirthyearStream({
      queryParameters: { project: projectId }
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

      const { users, reference_population } = usersByField.series;

      if (!reference_population) {
        setReferenceDataUploaded(false);
        return;
      }

      if (`${code}1` === 'birthyear1') {
        console.log(users)
        console.log(reference_population)
        return;
      }

      const referenceData = code === 'birthyear'
        ? toReferenceDataBirthyear(
            users,
            reference_population
          )
        : toReferenceDataRegField(
            users,
            reference_population,
            (usersByField as IUsersByRegistrationField).options
          );

      const includedUsers = getIncludedUsers(users, reference_population);

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

const toReferenceDataBirthyear = (
  users: Record<string, number>,
  referencePopulation: Record<string, number>,
) => {
  if (1 + 2 === 4) {
    console.log(users, referencePopulation)
  }
  return [] // TODO
}

export const toReferenceDataRegField = (
  users: Record<string, number>,
  referencePopulation: Record<string, number>,
  options: TOptions
): RepresentativenessRowMultiloc[] => {
  const optionIds = Object.keys(referencePopulation);
  const includedUsers = syncKeys(users, optionIds);

  const actualPercentages = roundPercentages(Object.values(includedUsers), 1);
  const referencePercentages = roundPercentages(
    Object.values(referencePopulation),
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
    referenceNumber: referencePopulation[optionId],
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
  users: Record<string, number>,
  referencePopulation: Record<string, number>,
): IncludedUsers => {
  const includedUsers = syncKeys(users, [
    ...Object.keys(referencePopulation),
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
