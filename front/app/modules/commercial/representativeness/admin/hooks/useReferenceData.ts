import { useState, useEffect } from 'react';
import moment, { Moment } from 'moment';

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

export interface RepresentativenessRow {
  name: string;
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
  const [includedUsersPercentage, setIncludedUsersPercentage] = useState<
    number | NilOrError
  >();
  const [uploadDate, setUploadDate] = useState<Moment | NilOrError>();

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
          setIncludedUsersPercentage(usersByField);
          setUploadDate(usersByField);
          return;
        }

        const referenceData = toReferenceData(usersByField);
        const includedUsersPercentage =
          getIncludedUsersPercentage(usersByField);
        setReferenceData(referenceData);
        setIncludedUsersPercentage(includedUsersPercentage);

        if (usersByField.referenceDataUploaded) {
          // Might need to change this depending on the date string format
          setUploadDate(moment(usersByField.referenceDataUploaded));
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [code]);

  return { referenceData, includedUsersPercentage, uploadDate };
}

export default useReferenceData;

const toReferenceData = (x: any): any => {
  // TODO
};

const getIncludedUsersPercentage = (x: any): any => {
  // TODO
};
