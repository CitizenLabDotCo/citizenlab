import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import AuthorsByDomicile from './AuthorsByDomicile';
import AuthorsByAge from './AuthorsByAge';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

const Demographics = () => {
  const { data: customFields } = useUserCustomFields();

  const selectedFields = customFields?.data.filter(
    (field) =>
      field.attributes.code === 'domicile' ||
      field.attributes.code === 'birthyear'
  );

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      {selectedFields?.map((field) => (
        <Box flex="1" key={field.id}>
          {field.attributes.code === 'domicile' && (
            <AuthorsByDomicile customFieldId={field.id} />
          )}
          {field.attributes.code === 'birthyear' && (
            <AuthorsByAge customFieldId={field.id} />
          )}
        </Box>
      ))}
    </Box>
  );
};

export default Demographics;
