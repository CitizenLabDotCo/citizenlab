import React from 'react';

// intl
import {
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import messages from '../messages';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import ToolboxItem from './ToolboxItem';

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
}

const FormBuilderToolbox = ({
  intl: { formatMessage },
  onAddField,
}: FormBuilderToolboxProps & WrappedComponentProps) => {
  const locale = useLocale();

  if (isNilOrError(locale)) return null;

  const addField = (inputType: ICustomFieldInputType) => {
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
      w="212px"
      display="flex"
      flexDirection="column"
      alignItems="center"
      bgColor="white"
      overflowY="auto"
      borderRight={`1px solid ${colors.mediumGrey}`}
    >
      <Box w="100%" display="inline">
        <Title
          fontWeight="normal"
          mb="4px"
          mt="24px"
          ml="12px"
          variant="h6"
          as="h3"
          color="secondaryText"
        >
          <FormattedMessage {...messages.addSurveyContent} />
        </Title>

        <DraggableElement>
          <ToolboxItem
            icon="short-answer"
            label={formatMessage(messages.shortAnswer)}
            onClick={() => addField('text')}
          />
          <ToolboxItem
            icon="multiple-choice"
            label={formatMessage(messages.multipleChoice)}
            onClick={() => addField('multiselect')}
          />
          <ToolboxItem
            icon="number-field"
            label={formatMessage(messages.number)}
            onClick={() => addField('number')}
          />
          <ToolboxItem
            icon="linear-scale"
            label={formatMessage(messages.linearScale)}
            onClick={() => addField('linear_scale')}
          />
        </DraggableElement>
      </Box>
    </Box>
  );
};

export default injectIntl(FormBuilderToolbox);
