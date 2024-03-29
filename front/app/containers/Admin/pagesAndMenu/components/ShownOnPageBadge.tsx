import React from 'react';

import { StatusLabel, colors, Text } from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';

import { injectIntl } from 'utils/cl-intl';

import messages from './messages';

interface StatusLabelTextProps {
  text: string;
  color: 'success' | 'error';
}

const StatusLabelText = ({ text, color }: StatusLabelTextProps) => {
  return (
    <Text color={color} fontWeight="bold" fontSize="xs" as="span" mb="0">
      {text}
    </Text>
  );
};

const ShownOnPageBadge = ({
  shownOnPage,
  intl: { formatMessage },
}: { shownOnPage: boolean } & WrappedComponentProps) => {
  if (shownOnPage) {
    return (
      <StatusLabel
        text={
          <StatusLabelText
            color="success"
            text={formatMessage(messages.shownOnPage)}
          />
        }
        backgroundColor={colors.successLight}
      />
    );
  }

  // not shown
  return (
    <StatusLabel
      text={
        <StatusLabelText
          color="error"
          text={formatMessage(messages.notShownOnPage)}
        />
      }
      backgroundColor={colors.errorLight}
    />
  );
};

export default injectIntl(ShownOnPageBadge);
