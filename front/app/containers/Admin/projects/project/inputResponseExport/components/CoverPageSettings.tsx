import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useWatch } from 'react-hook-form';

import Input from 'components/HookForm/Input';
import Toggle from 'components/HookForm/Toggle';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

import SectionLabel from './SectionLabel';

const CoverPageSettings = () => {
  const { formatMessage } = useIntl();
  const include = useWatch({ name: 'include' });

  return (
    <Box mb="24px">
      <Box mb="16px">
        <SectionLabel>
          <FormattedMessage {...messages.coverSectionTitle} />
        </SectionLabel>
      </Box>
      <Box mb="16px">
        <Toggle
          name="include"
          label={formatMessage(messages.includeCoverLabel)}
        />
      </Box>
      {include && (
        <Box display="flex" flexDirection="column" gap="12px">
          <Input
            type="text"
            name="title"
            label={formatMessage(messages.reportTitleLabel)}
          />
          <Input
            type="text"
            name="subtitle"
            label={formatMessage(messages.reportSubtitleLabel)}
          />
          <Box display="flex" gap="12px">
            <Box flex="1">
              <Input
                type="text"
                name="date"
                label={formatMessage(messages.dateLabel)}
              />
            </Box>
            <Box flex="1">
              <Input
                type="text"
                name="preparedBy"
                label={formatMessage(messages.preparedByLabel)}
              />
            </Box>
          </Box>
          <Input
            type="text"
            name="notes"
            label={formatMessage(messages.notesLabel)}
          />
        </Box>
      )}
    </Box>
  );
};

export default CoverPageSettings;
