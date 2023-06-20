import { useState, useEffect } from 'react';

// hooks
import useLocale from 'hooks/useLocale';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import {
  createGenderFieldSubscription,
  createRegFieldSubscription,
  RepresentativenessRowMultiloc,
  IncludedUsers,
  ageFieldToReferenceData,
  ageFieldToIncludedUsers,
} from './createRefDataSubscription';

// typings
import { IUserCustomFieldData } from 'api/user_custom_fields/types';
import useUsersByAge from 'api/users_by_age/useUsersByAge';

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
  const { data: usersByAge } = useUsersByAge({ project: projectId });
  const locale = useLocale();

  const code = userCustomField.attributes.code;
  const userCustomFieldId = userCustomField.id;

  useEffect(() => {
    if (isNilOrError(locale)) return;

    const setters = {
      setReferenceData,
      setIncludedUsers,
      setReferenceDataUploaded,
    };

    if (code === 'gender') {
      const subscription = createGenderFieldSubscription(projectId, setters);

      return () => subscription.unsubscribe();
    }

    if (code === 'birthyear') {
      if (!usersByAge) {
        setReferenceData(usersByAge);
        setIncludedUsers(usersByAge);
        return;
      }

      if (!usersByAge.data.attributes.series.reference_population) {
        setReferenceDataUploaded(false);
        return;
      }

      setReferenceData(ageFieldToReferenceData(usersByAge, locale));
      setIncludedUsers(ageFieldToIncludedUsers(usersByAge));
      setReferenceDataUploaded(true);
    }

    const subscription = createRegFieldSubscription(
      userCustomFieldId,
      projectId,
      setters
    );

    return () => subscription.unsubscribe();
  }, [code, userCustomFieldId, projectId, locale, usersByAge]);

  return {
    referenceData,
    includedUsers,
    referenceDataUploaded,
  };
}

export default useReferenceData;
