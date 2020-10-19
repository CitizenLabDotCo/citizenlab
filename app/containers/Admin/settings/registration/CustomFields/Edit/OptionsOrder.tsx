import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// services
import { IUserCustomFieldData } from 'services/userCustomFields';

// hooks
import useUserCustomFieldOptions from 'hooks/useUserCustomFieldOptions';
import useLocalize from 'hooks/useLocalize';

interface Props {
  customField: IUserCustomFieldData;
}

const Options = memo(({ customField }: Props) => {
  const userCustomFieldOptions = useUserCustomFieldOptions(customField.id);
  const localize = useLocalize();

  if (!isNilOrError(userCustomFieldOptions)) {
    userCustomFieldOptions.map((userCustomFieldOption, i) => {
      return (
        <div key={i}>
          {localize(userCustomFieldOption.attributes.title_multiloc)}
        </div>
      );
    });
  }

  return null;
});

export default Options;
