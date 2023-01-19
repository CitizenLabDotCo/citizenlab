import React from 'react';
import { useFormContext } from 'react-hook-form';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../messages';

// components
import ToolboxItem from './ToolboxItem';
import { Box, Title } from '@citizenlab/cl2-component-library';

// styles
import styled from 'styled-components';

// types
import { IFlatCustomField } from 'services/formCustomFields';

// Hooks
import useLocale from 'hooks/useLocale';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { BuiltInKeyType } from 'components/FormBuilder/utils';

const DraggableElement = styled.div`
  cursor: move;
`;

interface BuiltInFieldsProps {
  isEditingDisabled: boolean;
}

const BuiltInFields = ({
  intl: { formatMessage },
  isEditingDisabled,
}: BuiltInFieldsProps & WrappedComponentProps) => {
  const locale = useLocale();
  const { watch, trigger } = useFormContext();
  const formCustomFields: IFlatCustomField[] = watch('customFields');

  if (isNilOrError(locale)) return null;

  const enableField = (key: BuiltInKeyType) => {
    if (isEditingDisabled) {
      return;
    }

    const field = formCustomFields.find((field) => field.key === key);
    if (field) {
      field.enabled = true;
      trigger();
    }
  };

  return (
    <Box w="100%" display="inline">
      <Title
        fontWeight="normal"
        mb="4px"
        mt="24px"
        ml="16px"
        variant="h6"
        as="h3"
        color="textSecondary"
        style={{ textTransform: 'uppercase' }}
      >
        <FormattedMessage {...messages.defaultField} />
      </Title>

      <DraggableElement>
        <ToolboxItem
          icon="money-bag"
          label={formatMessage(messages.proposedBudget)}
          onClick={() => enableField('proposed_budget')}
          inputType="text"
        />
      </DraggableElement>
    </Box>
  );
};

export default injectIntl(BuiltInFields);
