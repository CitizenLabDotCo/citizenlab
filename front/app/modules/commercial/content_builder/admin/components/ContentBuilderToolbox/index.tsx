import React from 'react';

// craft
import { useEditor, Element } from '@craftjs/core';
import Container from '../CraftComponents/Container';
import Text from '../CraftComponents/Text';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';
import { Box, Icon } from '@citizenlab/cl2-component-library';

// Styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const ToolboxItemText = styled.p`
  color: ${colors.adminDarkestBackground};
  font-size: 15px;
`;

const ContentBuilderToolbox = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const { connectors } = useEditor();
  return (
    <>
      <Box
        borderStyle="solid"
        borderRight="none"
        borderTop="none"
        borderWidth="1px"
        w="100%"
        borderColor={colors.border}
      >
        <Box
          marginBottom="16px"
          width="100%"
          display="flex"
          paddingLeft="10px"
          ref={(ref) =>
            ref &&
            connectors.create(
              ref,
              <Element canvas is={Container} id="container" />
            )
          }
        >
          <Icon
            width="18px"
            height="18px"
            fill={colors.clBlue}
            name="column1"
          />
          <ToolboxItemText>{formatMessage(messages.oneColumn)}</ToolboxItemText>
        </Box>
        <Box
          marginBottom="16px"
          width="100%"
          display="flex"
          paddingLeft="10px"
          ref={(ref) =>
            ref &&
            connectors.create(
              ref,
              <Element canvas is={Container} id="container" />
            )
          }
        >
          <Icon
            width="18px"
            height="18px"
            fill={colors.clBlue}
            name="column2"
          />
          <ToolboxItemText>{formatMessage(messages.twoColumn)}</ToolboxItemText>
        </Box>
      </Box>
      <Box
        borderStyle="solid"
        borderRight="none"
        borderTop="none"
        borderWidth="1px"
        w="100%"
        borderColor={colors.border}
      >
        <Box
          marginBottom="16px"
          width="100%"
          display="flex"
          paddingLeft="10px"
          ref={(ref) =>
            ref &&
            connectors.create(ref, <Element text="Text" is={Text} id="text" />)
          }
        >
          <Icon width="18px" height="18px" fill={colors.clBlue} name="text" />
          <ToolboxItemText>{formatMessage(messages.text)}</ToolboxItemText>
        </Box>
      </Box>
    </>
  );
};

export default injectIntl(ContentBuilderToolbox);
