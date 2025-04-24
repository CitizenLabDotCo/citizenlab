import React from 'react';

import useCustomFieldsOptions from 'api/custom_field_options/useCustomFieldOptions';

import T from 'components/T';

export const SelectOptionText = ({
  customFieldId,
  selectedOptionKey,
}: {
  customFieldId: string;
  selectedOptionKey: string;
}) => {
  const { data: options } = useCustomFieldsOptions(customFieldId);
  const option = options?.data.find(
    (option) => option.attributes.key === selectedOptionKey
  );
  return option ? (
    <T value={option.attributes.title_multiloc} />
  ) : (
    <>No answer</>
  );
};
