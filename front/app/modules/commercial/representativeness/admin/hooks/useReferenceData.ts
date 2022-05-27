import { useState } from 'react';

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

const getStream = (code: TCustomFieldCode | null) => {
  if (code === null) return usersByRegFieldStream;
  if (code === 'gender') return usersByGenderStream;
  if (code === 'domicile') return usersByDomicileStream;
};

function useReferenceData(field: IUserCustomFieldData) {
  const [referenceData, useReferenceData] = useState();
}

export default useReferenceData;
