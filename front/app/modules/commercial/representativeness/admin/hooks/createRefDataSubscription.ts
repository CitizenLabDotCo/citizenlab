// services
import {
  usersByGenderStream,
  usersByAgeStream,
  usersByRegFieldStream,
  IUsersByAge,
  IUsersByRegistrationField
} from 'modules/commercial/user_custom_fields/services/stats';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { zipObject } from 'lodash-es';
import { sum, roundPercentage, roundPercentages } from 'utils/math';
import { forEachBin } from '../utils/bins';

// typings
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

interface Setters {
  setReferenceData: (referenceData: RepresentativenessRowMultiloc[] | NilOrError) => void;
  setIncludedUsers: (includedUsers: IncludedUsers | NilOrError) => void;
  setReferenceDataUploaded: (uploaded?: boolean) => void;
}

// Gender field
export const createGenderFieldSubscription = (
  projectId: string | undefined,
  setters: Setters
) => {
  const observable = usersByGenderStream(
    { queryParameters: { project: projectId } }
  ).observable;

  const subscription = observable.subscribe(
    handleRegFieldResponse(setters)
  )

  return subscription;
}

// Birthyear field
export const createAgeFieldSubscription = (
  projectId: string | undefined,
  {
    setReferenceData,
    setIncludedUsers,
    setReferenceDataUploaded
  }: Setters
) => {
  const observable = usersByAgeStream(
    { queryParameters: { project: projectId } }
  ).observable;

  const subscription = observable.subscribe(
    (usersByAge: IUsersByAge | NilOrError) => {
      if (isNilOrError(usersByAge)) {
        setReferenceData(usersByAge);
        setIncludedUsers(usersByAge);
        return;
      }

      if (!usersByAge.series.reference_population) {
        setReferenceDataUploaded(false);
        return;
      }

      setReferenceData(ageFieldToReferenceData(usersByAge));
      setIncludedUsers(ageFieldToIncludedUsers(usersByAge));
      setReferenceDataUploaded(true);
    }
  )

  return subscription;
}

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

  const subscription = observable.subscribe(
    handleRegFieldResponse(setters)
  );

  return subscription;
}

// Helpers
const handleRegFieldResponse = ({
  setReferenceData,
  setIncludedUsers,
  setReferenceDataUploaded
}: Setters) => (
  usersByRegField: IUsersByRegistrationField | NilOrError
) => {
    if (isNilOrError(usersByRegField)) {
      setReferenceData(usersByRegField);
      setIncludedUsers(usersByRegField);
      return;
    }

    if (!usersByRegField.series.reference_population) {
      setReferenceDataUploaded(false);
      return;
    }

    setReferenceData(regFieldToReferenceData(usersByRegField));
    setIncludedUsers(regFieldToIncludedUsers(usersByRegField));
    setReferenceDataUploaded(true);
  }

export const regFieldToReferenceData = (
  usersByField: IUsersByRegistrationField
): RepresentativenessRowMultiloc[] => {
  const { users, reference_population } = usersByField.series;

  const optionIds = Object.keys(reference_population);
  const includedUsers = syncKeys(users, optionIds);

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

export const regFieldToIncludedUsers = (
  usersByField: IUsersByRegistrationField
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

export const ageFieldToReferenceData = ({ 
  series: { user_counts, reference_population, bins }
}: IUsersByAge): RepresentativenessRowMultiloc[] => {
  const binIds = forEachBin(bins).map(({ binId }) => binId);
  const actualPercentages = roundPercentages(user_counts);
  const referencePercentages = roundPercentages(reference_population);
  
  return forEachBin(usersByAge.series.bins).map(({ binId }) => ({

  }))
}

export const ageFieldToIncludedUsers = (usersByAge: IUsersByAge): IncludedUsers => {

}