import React from 'react';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// components
import ToolboxItem from './ToolboxItem';
import { Box, Title } from '@citizenlab/cl2-component-library';

// intl
import messages from './messages';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const DraggableElement = styled.div`
  cursor: move;
`;

const SurveyBuilderToolbox = ({
  intl: { formatMessage },
}: InjectedIntlProps) => (
  <Box
    position="fixed"
    zIndex="99999"
    flex="0 0 auto"
    h="100%"
    w="210px"
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
        <ToolboxItem icon="text" label={formatMessage(messages.shortAnswer)} />
      </DraggableElement>
    </Box>
  </Box>
);

export default injectIntl(SurveyBuilderToolbox);
