import { useState, useEffect } from 'react';

import { IUserCustomFieldData } from 'api/user_custom_fields/types';
import useUsersByAge from 'api/users_by_age/useUsersByAge';
import useUsersByCustomField from 'api/users_by_custom_field/useUsersByCustomField';

import useLocale from 'hooks/useLocale';

import { isNilOrError, NilOrError } from 'utils/helperUtils';

import {
  RepresentativenessRowMultiloc,
  IncludedUsers,
  ageFieldToReferenceData,
  ageFieldToIncludedUsers,
  handleRegFieldResponse,
} from './parseReferenceData';

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

  const { code } = userCustomField.attributes;

  const { data: usersByAge } = useUsersByAge({
    project: projectId,
    enabled: code === 'birthyear',
  });

  const { data: usersByCustomField } = useUsersByCustomField({
    project: projectId,
    id: userCustomField.id,
    enabled: !code || code === 'domicile' || code === 'gender',
  });

  const locale = useLocale();

  useEffect(() => {
    if (isNilOrError(locale)) return;

    const setters = {
      setReferenceData,
      setIncludedUsers,
      setReferenceDataUploaded,
    };

    if (code === 'birthyear') {
      if (!usersByAge) {
        setReferenceData(usersByAge);
        setIncludedUsers(usersByAge);
        return;
      }

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
  }, [code, locale, usersByAge, usersByCustomField]);

  return {
    referenceData,
    includedUsers,
    referenceDataUploaded,
  };
}

export default useReferenceData;
