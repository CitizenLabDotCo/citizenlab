import { useState, useEffect } from 'react';

// utils
import { NilOrError } from 'utils/helperUtils';
import {
  createGenderFieldSubscription,
  createAgeFieldSubscription,
  createRegFieldSubscription,
  RepresentativenessRowMultiloc,
  IncludedUsers
} from './createRefDataSubscription';

// typings
import { IUserCustomFieldData } from 'modules/commercial/user_custom_fields/services/userCustomFields';

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
  
  const setters = { setReferenceData, setIncludedUsers, setReferenceDataUploaded };

  useEffect(() => {
    if (code === 'gender') {
      const subscription = createGenderFieldSubscription(
        projectId,
        setters
      );

      return () => subscription.unsubscribe();
    }

    if (code === 'birthyear') {
      const subscription = createAgeFieldSubscription(
        projectId,
        setters
      );

      return () => subscription.unsubscribe();
    }

    const subscription = createRegFieldSubscription(
      userCustomFieldId,
      projectId,
      setters
    );

    return () => subscription.unsubscribe();
  }, [code, userCustomFieldId, projectId]);

  return {
    referenceData,
    includedUsers,
    referenceDataUploaded,
  };
}

export default useReferenceData;
