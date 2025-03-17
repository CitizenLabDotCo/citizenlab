import React, { useEffect, useState } from 'react';

import {
  Box,
  IconButton,
  Spinner,
  colors,
  Text,
} from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';

import { IUserCustomFieldData } from 'api/user_custom_fields/types';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import AuthorsByAge from './AuthorsByAge';
import AuthorsByDomicile from './AuthorsByDomicile';
import messages from './messages';

const SUPPORTED_CODES: IUserCustomFieldData['attributes']['code'][] = [
  'birthyear',
  'domicile',
];

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

const Demographics = () => {
  const { formatMessage } = useIntl();
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

  if (!customFields) {
    return <Spinner />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        {selectedField?.attributes.code === 'birthyear' && (
          <Text fontWeight="bold">
            <FormattedMessage {...messages.authorsByAge} />
          </Text>
        )}
        {selectedField?.attributes.code === 'domicile' && (
          <Text fontWeight="bold">
            <FormattedMessage {...messages.authorsByDomicile} />
          </Text>
        )}
        <Box display="flex" alignItems="center" justifyContent="flex-end">
          <IconButton
            iconName="chevron-left"
            onClick={() => handleCycle(-1)}
            a11y_buttonActionMessage={formatMessage(messages.previousGraph)}
            iconColor={colors.grey600}
            iconColorOnHover={colors.grey700}
            iconWidth="20px"
          />
          {selectedFieldId && (
            <Text mx="8px">
              {supportedFieldIds.findIndex((id) => id === selectedFieldId) + 1}/
              {supportedFieldIds.length}
            </Text>
          )}
          <IconButton
            iconName="chevron-right"
            onClick={() => handleCycle(1)}
            a11y_buttonActionMessage={formatMessage(messages.nextGraph)}
            iconColor={colors.grey600}
            iconColorOnHover={colors.grey700}
            iconWidth="20px"
          />
        </Box>
      </Box>
      {selectedField?.attributes.code === 'birthyear' && (
        <AuthorsByAge customFieldId={selectedField.id} />
      )}
      {selectedField?.attributes.code === 'domicile' && (
        <AuthorsByDomicile customFieldId={selectedField.id} />
      )}
    </Box>
  );
};

export default Demographics;
