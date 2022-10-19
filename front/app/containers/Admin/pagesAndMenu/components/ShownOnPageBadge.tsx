import React from 'react';

// styling
import { StatusLabel, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const StyledStatusLabel = styled(StatusLabel)`
  height: 20px;
`;

const ShownOnPageBadge = ({ shownOnPage }: { shownOnPage: boolean }) => {
  if (shownOnPage) {
    return (
      <StyledStatusLabel
        text={
          <span style={{ color: colors.success }}>
            <FormattedMessage {...messages.shownOnPage} />
          </span>
        }
        backgroundColor={colors.successLight}
      />
    );
  }

  return (
    <StyledStatusLabel
      text={
        <span style={{ color: colors.error }}>
          <FormattedMessage {...messages.notShownOnPage} />
        </span>
      }
      backgroundColor={colors.red100}
    />
  );
};

export default ShownOnPageBadge;
