import React, { useEffect, useState } from 'react';
import { Box, IconButton, colors } from '@citizenlab/cl2-component-library';
import AuthorsByDomicile from './AuthorsByDomicile';
import AuthorsByAge from './AuthorsByAge';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';
import { IUserCustomFieldData } from 'api/user_custom_fields/types';
import { isEmpty } from 'lodash-es';

const SUPPORTED_CODES: IUserCustomFieldData['attributes']['code'][] = [
  'birthyear',
  'domicile',
];

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

const Demographics = () => {
  const [supportedFieldIds, setSupportedFieldIds] = useState<string[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const { data: customFields } = useUserCustomFields();

  const selectedField = customFields?.data.find(
    (field) => field.id === selectedFieldId
  );

  useEffect(() => {
    setSupportedFieldIds((supportedFieldIds) => {
      if (isEmpty(supportedFieldIds) && customFields) {
        const supportedFields = customFields.data.filter((field) =>
          SUPPORTED_CODES.includes(field.attributes.code)
        );
        if (!isEmpty(supportedFields)) {
          setSelectedFieldId(supportedFields[0].id);
        }
        return supportedFields.map((field) => field.id);
      } else {
        return supportedFieldIds;
      }
    });
  }, [customFields, setSelectedFieldId, setSupportedFieldIds]);

  const handleCycle = (offset: number) => {
    setSelectedFieldId((currentSelectedFieldId) => {
      const currentIndex = supportedFieldIds.findIndex(
        (id) => id === currentSelectedFieldId
      );
      const newIndex = mod(currentIndex + offset, supportedFieldIds.length);
      return supportedFieldIds[newIndex];
    });
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      height="100%"
    >
      <Box>
        <IconButton
          iconName="chevron-left"
          onClick={() => handleCycle(-1)}
          a11y_buttonActionMessage={'Previous graph'}
          iconColor={colors.grey600}
          iconColorOnHover={colors.grey700}
        />
      </Box>
      <Box flex="1">
        {selectedField?.attributes.code === 'birthyear' && (
          <AuthorsByAge customFieldId={selectedField.id} />
        )}
        {selectedField?.attributes.code === 'domicile' && (
          <AuthorsByDomicile customFieldId={selectedField.id} />
        )}
      </Box>
      <Box>
        <IconButton
          iconName="chevron-right"
          onClick={() => handleCycle(1)}
          a11y_buttonActionMessage={'Next graph'}
          iconColor={colors.grey600}
          iconColorOnHover={colors.grey700}
        />
      </Box>
    </Box>
  );
};

export default Demographics;
