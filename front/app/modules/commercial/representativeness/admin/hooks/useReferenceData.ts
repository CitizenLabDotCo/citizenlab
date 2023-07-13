import { useState, useEffect } from 'react';

// hooks
import useLocale from 'hooks/useLocale';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import {
  RepresentativenessRowMultiloc,
  IncludedUsers,
  ageFieldToReferenceData,
  ageFieldToIncludedUsers,
  handleRegFieldResponse,
} from './parseReferenceData';

// typings
import { IUserCustomFieldData } from 'api/user_custom_fields/types';
import useUsersByAge from 'api/users_by_age/useUsersByAge';
import useUsersByGender from 'api/users_by_gender/useUsersByGender';
import useUsersByCustomField from 'api/users_by_custom_field/useUsersByCustomField';

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
  const { data: usersByAge } = useUsersByAge({
    project: projectId,
    enabled: code === 'birthyear',
  });
  const { data: usersByGender } = useUsersByGender({
    project: projectId,
    enabled: code === 'gender',
  });
  const { data: usersByCustomField } = useUsersByCustomField({
    project: projectId,
    id: userCustomField.id,
    enabled: !code || code === 'domicile',
  });

  const locale = useLocale();

  useEffect(() => {
    if (isNilOrError(locale)) return;

    const setters = {
      setReferenceData,
      setIncludedUsers,
      setReferenceDataUploaded,
    };

    if (code === 'gender') {
      handleRegFieldResponse(usersByGender, setters);
      return;
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
      return;
    }

    handleRegFieldResponse(usersByCustomField, setters);
  }, [code, locale, usersByAge, usersByGender, usersByCustomField]);

  return {
    referenceData,
    includedUsers,
    referenceDataUploaded,
  };
}

export default useReferenceData;
