import { useState, useEffect } from 'react';

// services
import {
  usersByRegFieldStream,
  usersByGenderStream,
  usersByDomicileStream,
} from 'modules/commercial/user_custom_fields/services/stats';

// typings
import {
  IUserCustomFieldData,
  TCustomFieldCode,
} from 'modules/commercial/user_custom_fields/services/userCustomFields';
import { NilOrError } from 'utils/helperUtils';

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
  const [includedUsers, setIncludedUsers] = useState<number | NilOrError>();
  const code = field.attributes.code;

  useEffect(() => {
    const stream = getStream(code);
    if (!stream) {
      setReferenceData(null);
      return;
    }

    // TODO get data from stream
    // TODO transform data, calc percentages etc
    // TODO also get included data percentage
  }, [code]);

  return { referenceData, includedUsers };
}

export default useReferenceData;
