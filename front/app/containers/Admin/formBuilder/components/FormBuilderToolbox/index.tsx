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
import { generateTempId } from '../FormBuilderSettings/utils';

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
      temp_id: generateTempId(),
      logic: {
        ...(inputType !== 'page' ? { rules: [] } : undefined),
      },
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
      borderRight={`1px solid ${colors.borderLight}`}
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
            icon="page"
            label={formatMessage(messages.page)}
            onClick={() => addField('page')}
            data-cy="e2e-page"
          />
          <ToolboxItem
            icon="survey-short-answer-2"
            label={formatMessage(messages.shortAnswer)}
            onClick={() => addField('text')}
            data-cy="e2e-short-answer"
          />
          <ToolboxItem
            icon="survey-long-answer-2"
            label={formatMessage(messages.longAnswer)}
            onClick={() => addField('multiline_text')}
            data-cy="e2e-long-answer"
          />
          <ToolboxItem
            icon="survey-single-choice"
            label={formatMessage(messages.singleChoice)}
            onClick={() => addField('select')}
            data-cy="e2e-single-choice"
          />
          <ToolboxItem
            icon="survey-multiple-choice-2"
            label={formatMessage(messages.multipleChoice)}
            onClick={() => addField('multiselect')}
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
          <ToolboxItem
            icon="upload-file"
            label={formatMessage(messages.fileUpload)}
            onClick={() => addField('file_upload')}
            data-cy="e2e-file-upload-field"
          />
        </DraggableElement>
      </Box>
    </Box>
  );
};

export default injectIntl(FormBuilderToolbox);
