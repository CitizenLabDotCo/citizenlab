import React from 'react';

// styling
import styled from 'styled-components';
import { colors, Box } from '@citizenlab/cl2-component-library';

// craft
import { useNode } from '@craftjs/core';

// components
import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

// i18n
import messages from 'containers/Admin/reporting/components/ReportBuilder/Widgets/TitleMultiloc/messages';
import { useIntl } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';

// hooks
import useReportDefaultPadding from 'containers/Admin/reporting/hooks/useReportDefaultPadding';

// typings
import { Multiloc } from 'typings';

const H3 = styled.h3<{ color: string }>`
  color: ${({ color }) => color};
  font-size: 20px;
  margin-top: 4px;
  margin-bottom: 4px;
`;

interface Props {
  text?: Multiloc;
}

const Title = ({ text }: Props) => {
  const px = useReportDefaultPadding();
  const localize = useLocalize();

  return (
    <PageBreakBox className="e2e-text-box" minHeight="26px" px={px}>
      <H3 color={colors.primary}>{localize(text)}</H3>
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
      <InputMultilocWithLocaleSwitcher
        id="e2e-title-text-input"
        placeholder={formatMessage(messages.title)}
        type="text"
        valueMultiloc={text}
        onChange={(value) => {
          setProp((props) => (props.text = value));
        }}
      />
    </Box>
  );
};

Title.craft = {
  props: {
    text: {},
  },
  related: {
    settings: TitleSettings,
  },
  custom: {
    title: messages.title,
  },
};

export default Title;
