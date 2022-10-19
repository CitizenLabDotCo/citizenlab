import React from 'react';

// styling
import { StatusLabel, colors, Text } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const ShownOnPageBadge = ({ shownOnPage }: { shownOnPage: boolean }) => {
  if (shownOnPage) {
    return (
      <StatusLabel
        text={
          <Text color="success">
            <FormattedMessage {...messages.shownOnPage} />
          </Text>
        }
        backgroundColor={colors.successLight}
      />
    );
  }

  // not shown
  return (
    <StatusLabel
      text={
        <Text color="error">
          <FormattedMessage {...messages.notShownOnPage} />
        </Text>
      }
      backgroundColor={colors.red100}
    />
  );
};

export default ShownOnPageBadge;
