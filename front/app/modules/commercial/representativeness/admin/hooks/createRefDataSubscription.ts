// services
import {
  usersByGenderStream,
  usersByRegFieldStream,
  IUsersByAge,
  IUsersByRegistrationField,
} from 'services/userCustomFieldStats';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { zipObject } from 'lodash-es';
import { sum, roundPercentage, roundPercentages } from 'utils/math';
import { forEachBin } from '../utils/bins';

// typings
import { Multiloc, Locale } from 'typings';

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

// Gender field
export const createGenderFieldSubscription = (
  projectId: string | undefined,
  setters: Setters
) => {
  const observable = usersByGenderStream({
    queryParameters: { project: projectId },
  }).observable;

  const subscription = observable.subscribe(handleRegFieldResponse(setters));

  return subscription;
};

// Other registration fields
export const createRegFieldSubscription = (
  userCustomFieldId: string,
  projectId: string | undefined,
  setters: Setters
) => {
  const observable = usersByRegFieldStream(
    { queryParameters: { project: projectId } },
    userCustomFieldId
  ).observable;

  const subscription = observable.subscribe(handleRegFieldResponse(setters));

  return subscription;
};

// Helpers
const handleRegFieldResponse =
  ({ setReferenceData, setIncludedUsers, setReferenceDataUploaded }: Setters) =>
  (usersByRegField: IUsersByRegistrationField | NilOrError) => {
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
  usersByField: IUsersByRegistrationField
): RepresentativenessRowMultiloc[] => {
  const { users, reference_population } = usersByField.data.attributes.series;

  const optionIds = Object.keys(reference_population);
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
    fixedUsers[key] = users[key] ?? 0;
  });

  return fixedUsers;
};

export const regFieldToIncludedUsers = (
  usersByField: IUsersByRegistrationField
): IncludedUsers => {
  const { users, reference_population } = usersByField.data.attributes.series;
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
  locale: Locale
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
