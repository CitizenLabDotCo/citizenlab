import React from 'react';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// components
import ToolboxItem from './ToolboxItem';
import { Box, Title } from '@citizenlab/cl2-component-library';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

import { IFlatCreateCustomField } from 'modules/free/native_surveys/services/surveyCustomFields';

const DraggableElement = styled.div`
  cursor: move;
`;

interface SurveyBuilderToolboxProps {
  onAddField: (field: IFlatCreateCustomField) => void;
}

const SurveyBuilderToolbox = ({
  intl: { formatMessage },
  onAddField,
}: SurveyBuilderToolboxProps & InjectedIntlProps) => {
  const handleAddShortAnswer = () => {
    onAddField({
      id: `${Math.random()}`,
      isLocalOnly: true,
      description_multiloc: {},
      input_type: 'text',
      required: false,
      title_multiloc: { en: 'New field' },
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
      bgColor="#ffffff"
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
            onClick={handleAddShortAnswer}
          />
        </DraggableElement>
      </Box>
    </Box>
  );
};

export default injectIntl(SurveyBuilderToolbox);
