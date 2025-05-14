import { zipObject } from 'lodash-es';
import { Multiloc, SupportedLocale } from 'typings';

import { IUsersByAge } from 'api/users_by_age/types';
import { IUsersByCustomField } from 'api/users_by_custom_field/types';

import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { sum, roundPercentage, roundPercentages } from 'utils/math';

import { forEachBin } from '../utils/representativeness/bins';

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

interface Setters {
  setReferenceData: (
    referenceData: RepresentativenessRowMultiloc[] | NilOrError
  ) => void;
  setIncludedUsers: (includedUsers: IncludedUsers | NilOrError) => void;
  setReferenceDataUploaded: (uploaded?: boolean) => void;
}

// Helpers
export const handleRegFieldResponse = (
  usersByRegField: IUsersByCustomField | undefined,
  { setReferenceData, setIncludedUsers, setReferenceDataUploaded }: Setters
) => {
  if (isNilOrError(usersByRegField)) {
    setReferenceData(usersByRegField);
    setIncludedUsers(usersByRegField);
    return;
  }

  if (!usersByRegField.data.attributes.series.reference_population) {
    setReferenceDataUploaded(false);
    return;
  }

  setReferenceData(regFieldToReferenceData(usersByRegField));
  setIncludedUsers(regFieldToIncludedUsers(usersByRegField));
  setReferenceDataUploaded(true);
};

export const regFieldToReferenceData = (
  usersByField: IUsersByCustomField
): RepresentativenessRowMultiloc[] => {
  const { users, reference_population } = usersByField.data.attributes.series;
  if (reference_population === null) return [];

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const optionIds = reference_population && Object.keys(reference_population);
  const includedUsers = syncKeys(users, optionIds);

  const options = usersByField.data.attributes.options;

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
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    fixedUsers[key] = users[key] ?? 0;
  });

  return fixedUsers;
};

export const regFieldToIncludedUsers = (
  usersByField: IUsersByCustomField
): IncludedUsers => {
  const { users, reference_population } = usersByField.data.attributes.series;
  if (reference_population === null) {
    return {
      known: 0,
      total: 0,
      percentage: 0,
    };
  }

  const includedUsers = syncKeys(users, [
    ...Object.keys(reference_population),
    '_blank',
  ]);

  const known = Object.keys(includedUsers)
    .filter((optionId) => optionId !== '_blank')
    .reduce((acc, v) => includedUsers[v] + acc, 0);

  const total = sum(Object.values(includedUsers));
  const percentage = total === 0 ? 0 : roundPercentage(known, total);

  return {
    known,
    total,
    percentage,
  };
};

export const ageFieldToReferenceData = (
  data: IUsersByAge,
  locale: SupportedLocale
): RepresentativenessRowMultiloc[] => {
  const {
    series: { user_counts, reference_population, bins },
  } = data.data.attributes;

  const actualPercentages = roundPercentages(user_counts, 1);
  const referencePercentages = roundPercentages(reference_population, 1);

  return forEachBin(bins).map(({ binId }, i) => ({
    title_multiloc: { [locale]: binId },
    actualPercentage: actualPercentages[i],
    referencePercentage: referencePercentages[i],
    actualNumber: user_counts[i],
    referenceNumber: reference_population[i],
  }));
};

export const ageFieldToIncludedUsers = (data: IUsersByAge): IncludedUsers => {
  const { total_user_count: total, unknown_age_count: unknown } =
    data.data.attributes;

  const known = total - unknown;
  const percentage = roundPercentage(known, total);

  return {
    known,
    total,
    percentage,
  };
};
