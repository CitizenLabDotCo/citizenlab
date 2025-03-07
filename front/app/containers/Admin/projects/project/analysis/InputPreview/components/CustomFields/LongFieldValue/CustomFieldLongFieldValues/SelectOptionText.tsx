import React from 'react';

import useUserCustomFieldsOptions from 'api/user_custom_fields_options/useUserCustomFieldsOptions';

import T from 'components/T';

export const SelectOptionText = ({
  customFieldId,
  selectedOptionKey,
}: {
  customFieldId: string;
  selectedOptionKey: string;
}) => {
  const { data: options } = useUserCustomFieldsOptions(customFieldId);
  const option = options?.data.find(
    (option) => option.attributes.key === selectedOptionKey
  );
  return option ? (
    <T value={option.attributes.title_multiloc} />
  ) : (
    <>No answer</>
  );
};
