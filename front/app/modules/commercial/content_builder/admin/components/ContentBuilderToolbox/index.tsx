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
  margin-bottom: 24px;
  width: 100%;
  display: flex;
  gap: 20px;
  justify-content: left;
  padding-left: 10px;
`;

const ToolboxItemText = styled.p`
  color: ${colors.adminDarkestBackground};
  font-size: 15px;
`;

const ToolboxHeader = styled.h1`
  font-size: 18px;
  padding-left: 10px;
  color: ${colors.adminDarkestBackground};
`;

const ContentBuilderToolbox = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const { connectors } = useEditor();
  return (
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
        <Icon name="eye" />
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
        <Icon name="eye" />
        <ToolboxItemText>{formatMessage(messages.oneColumn)}</ToolboxItemText>
      </ComponentToolboxItem>
    </ToolboxSection>
  );
};

export default injectIntl(ContentBuilderToolbox);
