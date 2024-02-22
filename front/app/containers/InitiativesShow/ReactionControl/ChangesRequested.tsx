import React from 'react';
import { colors, Box, Icon } from '@citizenlab/cl2-component-library';
import { StatusWrapper, StatusExplanation } from './SharedStyles';
import T from 'components/T';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { StatusComponentProps } from './Status';

const ChangesRequested = ({ initiativeStatus }: StatusComponentProps) => {
  return (
    <Box>
      <Box mb="16px">
        <StatusWrapper>
          <T value={initiativeStatus.attributes.title_multiloc} />
        </StatusWrapper>
      </Box>
      <Icon
        ariaHidden
        name="halt"
        fill={colors.red600}
        width="30px"
        height="30px"
        mb="20px"
      />
      <StatusExplanation>
        <b>
          <FormattedMessage
            {...messages.changesRequestedStatusExplanationBold}
          />
        </b>{' '}
        <FormattedMessage
          {...messages.changesRequestedStatusExplanationSentenceTwo}
        />
      </StatusExplanation>
    </Box>
  );
};

export default ChangesRequested;
