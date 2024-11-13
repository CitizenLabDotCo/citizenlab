import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { ICustomFieldInputType } from 'api/custom_fields/types';

import { FormBuilderConfig } from 'components/FormBuilder/utils';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

import ToolboxItem from './ToolboxItem';
import { DraggableElement } from './utils';

interface BuiltInFieldsProps {
  addField: (inputType: ICustomFieldInputType) => void;
  builderConfig: FormBuilderConfig;
}

const LayoutFields = ({ addField, builderConfig }: BuiltInFieldsProps) => {
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
      <DraggableElement>
        {builderConfig.groupingType === 'section' && (
          <ToolboxItem
            icon="section"
            label={formatMessage(messages.section)}
            onClick={() => addField('section')}
            fieldsToExclude={builderConfig.toolboxFieldsToExclude}
            inputType="section"
          />
        )}
        {builderConfig.groupingType === 'page' && (
          <ToolboxItem
            icon="page"
            label={formatMessage(messages.page)}
            onClick={() => addField('page')}
            data-cy="e2e-page"
            fieldsToExclude={builderConfig.toolboxFieldsToExclude}
            inputType="page"
          />
        )}
      </DraggableElement>
    </Box>
  );
};

export default LayoutFields;
