import React from 'react';

// styling
import styled, { useTheme } from 'styled-components';

// craft
import { useNode } from '@craftjs/core';

// components
import {
  Box,
  Input,
  Title as TitleComponent,
} from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

const H3 = styled.h3<{ color: string }>`
  color: ${({ color }) => color};
  font-size: 20px;
`;

interface Props {
  text: string;
}

const Title = ({ text }: Props) => {
  const theme = useTheme();

  return (
    <Box id="e2e-text-box" minHeight="26px" mb="12px" mt="12px">
      <H3 color={theme.colors.tenantPrimary}>{text}</H3>
    </Box>
  );
};

const TitleSettings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    text,
  } = useNode((node) => ({
    text: node.data.props.text,
  }));

  return (
    <Box background="#ffffff" marginBottom="20px">
      <Input
        id="e2e-title-text-input"
        label={
          <TitleComponent variant="h4" as="h3">
            {formatMessage(messages.title)}
          </TitleComponent>
        }
        placeholder={formatMessage(messages.title)}
        type="text"
        value={text}
        onChange={(value) => {
          setProp((props) => (props.text = value));
        }}
      />
    </Box>
  );
};

Title.craft = {
  props: {
    text: '',
  },
  related: {
    settings: TitleSettings,
  },
  custom: {
    title: messages.title,
  },
};

export default Title;
