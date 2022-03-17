import React from 'react';

// craft
import { useEditor, Element } from '@craftjs/core';
import Container from '../CraftComponents/Container';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// Styling
import { Box, Icon } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const ToolboxSection = styled(Box)`
  border-style: solid;
  border-right-style: none;
  border-top-style: none;
  border-width: 1px;
  border-color: ${colors.border};
  width: 100%;
`;

const ComponentToolboxItem = styled(Box)`
  margin-bottom: 16px;
  width: 100%;
  display: flex;
  gap: 20px;
  padding-left: 10px;
`;

const ToolboxItemText = styled.p`
  color: ${colors.adminDarkestBackground};
  font-size: 15px;
`;

const ToolboxHeader = styled.h1`
  padding-top: 10px;
  font-size: 16px;
  padding-left: 10px;
  color: ${colors.adminDarkestBackground};
`;

const ToolboxIcon = styled(Icon)`
  width: 18px;
  height: 18px;
`;

const ContentBuilderToolbox = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const { connectors } = useEditor();
  return (
    <>
      <ToolboxSection>
        <ToolboxHeader>Sections</ToolboxHeader>
        <ComponentToolboxItem
          ref={(ref) =>
            ref &&
            connectors.create(
              ref,
              <Element canvas is={Container} id="container" />
            )
          }
        >
          <ToolboxIcon name="column1" />
          <ToolboxItemText>{formatMessage(messages.oneColumn)}</ToolboxItemText>
        </ComponentToolboxItem>
        <ComponentToolboxItem
          ref={(ref) =>
            ref &&
            connectors.create(
              ref,
              <Element canvas is={Container} id="container" />
            )
          }
        >
          <ToolboxIcon name="column2" />
          <ToolboxItemText>{formatMessage(messages.twoColumn)}</ToolboxItemText>
        </ComponentToolboxItem>
      </ToolboxSection>
      <ToolboxSection>
        <ToolboxHeader>Elements</ToolboxHeader>
        <ComponentToolboxItem
          ref={(ref) =>
            ref &&
            connectors.create(
              ref,
              <Element canvas is={Container} id="container" />
            )
          }
        >
          <ToolboxIcon name="text" />
          <ToolboxItemText>{formatMessage(messages.text)}</ToolboxItemText>
        </ComponentToolboxItem>
      </ToolboxSection>
    </>
  );
};

export default injectIntl(ContentBuilderToolbox);
