import React from 'react';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
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

const DraggableElement = styled.div`
  cursor: move;
`;

interface FormBuilderToolboxProps {
  onAddField: (field: IFlatCreateCustomField) => void;
}

const FormBuilderToolbox = ({
  intl: { formatMessage },
  onAddField,
}: FormBuilderToolboxProps & InjectedIntlProps) => {
  const addAnswer = (inputType: ICustomFieldInputType) => {
    onAddField({
      id: `${Math.floor(Date.now() * Math.random())}`,
      isLocalOnly: true,
      description_multiloc: {},
      input_type: inputType,
      required: false,
      title_multiloc: {},
      options: [
        {
          // TODO: Ask Ben what the starter data should be
          title_multiloc: {
            en: '',
          },
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
            onClick={() => addAnswer('text')}
          />
          <ToolboxItem
            icon="info"
            label={formatMessage(messages.multipleChoice)}
            onClick={() => addAnswer('multiselect')}
          />
          <ToolboxItem
            icon="info"
            label={formatMessage(messages.number)}
            onClick={() => addAnswer('number')}
          />
          <ToolboxItem
            icon="info"
            label={formatMessage(messages.email)}
            onClick={() => addAnswer('email')}
          />
          <ToolboxItem
            icon="info"
            label={formatMessage(messages.linearScale)}
            onClick={() => addAnswer('linear_scale')}
          />
        </DraggableElement>
      </Box>
    </Box>
  );
};

export default injectIntl(FormBuilderToolbox);
