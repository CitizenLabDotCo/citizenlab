import React from 'react';

// styling
import styled from 'styled-components';

// craft
import { useNode } from '@craftjs/core';

// components
import { Box, Input, colors } from '@citizenlab/cl2-component-library';
import PageBreakBox from '../PageBreakBox';

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
  return (
    <PageBreakBox className="e2e-text-box" minHeight="26px" mb="12px" mt="12px">
      <H3 color={colors.primary}>{text}</H3>
    </PageBreakBox>
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
