import React from 'react';

// styling
import styled from 'styled-components';
import { colors, Box, Input } from '@citizenlab/cl2-component-library';

// craft
import { useNode } from '@craftjs/core';

// components
import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';

// i18n
import messages from 'components/admin/ContentBuilder/Widgets/Title/messages';
import { useIntl } from 'utils/cl-intl';
import useReportDefaultPadding from 'containers/Admin/reporting/hooks/useReportDefaultPadding';

const H3 = styled.h3<{ color: string }>`
  color: ${({ color }) => color};
  font-size: 20px;
`;

interface Props {
  text: string;
}

const Title = ({ text }: Props) => {
  const px = useReportDefaultPadding();

  return (
    <PageBreakBox
      className="e2e-text-box"
      minHeight="26px"
      mb="12px"
      mt="12px"
      px={px}
    >
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
