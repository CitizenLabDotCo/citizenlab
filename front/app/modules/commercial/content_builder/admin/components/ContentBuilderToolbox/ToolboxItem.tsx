import React from 'react';

// craft
import { useEditor, Element, UserComponent } from '@craftjs/core';

// Components
import {
  Box,
  colors,
  Icon,
  IconNames,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import Container from '../CraftComponents/Container';
import Text from '../CraftComponents/Text';

// Intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

const ToolboxItemText = styled.p`
  color: ${colors.adminDarkestBackground};
  font-size: 15px;
`;

interface Props {
  componentType: string;
  label: ReactIntl.FormattedMessage.MessageDescriptor;
}

const ToolboxItem = ({
  componentType,
  label,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const { connectors } = useEditor();

  // Assign element type
  let itemType: UserComponent<any> | undefined;
  let iconStyle: IconNames;

  switch (componentType.toString()) {
    case 'Container':
      itemType = Container;
      iconStyle = 'column1';
      break;
    case 'Text':
      itemType = Text;
      iconStyle = 'text';
      break;
    default:
      itemType = undefined;
      iconStyle = 'error';
  }

  return (
    <Box
      marginBottom="16px"
      width="100%"
      display="flex"
      paddingLeft="10px"
      ref={(ref) =>
        ref &&
        connectors.create(
          ref,
          <Element canvas is={itemType} id={componentType} />
        )
      }
    >
      <Icon width="20px" height="20px" fill={colors.clBlue} name={iconStyle} />
      <ToolboxItemText>{formatMessage(label)}</ToolboxItemText>
    </Box>
  );
};

export default injectIntl(ToolboxItem);
