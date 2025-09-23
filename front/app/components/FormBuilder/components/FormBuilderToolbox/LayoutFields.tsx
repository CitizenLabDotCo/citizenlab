import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { FormBuilderConfig } from 'components/FormBuilder/utils';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

import ToolboxItem from './ToolboxItem';

interface BuiltInFieldsProps {
  builderConfig: FormBuilderConfig;
}

const LayoutFields = ({ builderConfig }: BuiltInFieldsProps) => {
  const { formatMessage } = useIntl();

  return (
    <Box w="100%" display="inline">
      <Title
        mb="4px"
        ml="16px"
        variant="h6"
        as="h3"
        color="textSecondary"
        style={{ textTransform: 'uppercase' }}
      >
        <FormattedMessage {...messages.layout} />
      </Title>
      <ToolboxItem
        icon="page"
        label={formatMessage(messages.page)}
        data-cy="e2e-page"
        fieldsToInclude={builderConfig.toolboxFieldsToInclude}
        inputType="page"
        dragId="toolbox_page"
        dragIndex={0}
      />
    </Box>
  );
};

export default LayoutFields;
