import React from 'react';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../messages';

// components
import ToolboxItem from './ToolboxItem';
import { Box, Title } from '@citizenlab/cl2-component-library';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// types
import {
  ICustomFieldInputType,
  IFlatCreateCustomField,
} from 'services/formCustomFields';

// Hooks
import useLocale from 'hooks/useLocale';

// utils
import { isNilOrError } from 'utils/helperUtils';

const DraggableElement = styled.div`
  cursor: move;
`;

interface FormBuilderToolboxProps {
  onAddField: (field: IFlatCreateCustomField) => void;
  isEditingDisabled: boolean;
}

const FormBuilderToolbox = ({
  intl: { formatMessage },
  onAddField,
  isEditingDisabled,
}: FormBuilderToolboxProps & WrappedComponentProps) => {
  const locale = useLocale();

  if (isNilOrError(locale)) return null;

  const addField = (inputType: ICustomFieldInputType) => {
    if (isEditingDisabled) {
      return;
    }

    onAddField({
      id: `${Math.floor(Date.now() * Math.random())}`,
      isLocalOnly: true,
      description_multiloc: {},
      input_type: inputType,
      required: false,
      title_multiloc: {
        [locale]: '',
      },
      maximum_label_multiloc: {},
      minimum_label_multiloc: {},
      maximum: 5,
      options: [
        {
          title_multiloc: {},
        },
      ],
      enabled: true,
    });
  };

  return (
    <Box
      position="fixed"
      zIndex="99999"
      flex="0 0 auto"
      h="100%"
      w="210px"
      display="flex"
      flexDirection="column"
      alignItems="center"
      bgColor="white"
      overflowY="auto"
      borderRight={`1px solid ${colors.grey500}`}
    >
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
          <FormattedMessage {...messages.addSurveyContent} />
        </Title>

        <DraggableElement>
          <ToolboxItem
            icon="survey-short-answer"
            label={formatMessage(messages.shortAnswer)}
            onClick={() => addField('text')}
            data-cy="e2e-short-answer"
          />
          <ToolboxItem
            icon="survey-multiple-choice"
            label={formatMessage(messages.multipleChoice)}
            onClick={() => addField('select')}
            data-cy="e2e-multiple-choice"
          />
          <ToolboxItem
            icon="survey-linear-scale"
            label={formatMessage(messages.linearScale)}
            onClick={() => addField('linear_scale')}
            data-cy="e2e-linear-scale"
          />
          <ToolboxItem
            icon="survey-number-field"
            label={formatMessage(messages.number)}
            onClick={() => addField('number')}
            data-cy="e2e-number-field"
          />
        </DraggableElement>
      </Box>
    </Box>
  );
};

export default injectIntl(FormBuilderToolbox);
