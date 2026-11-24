import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

// Ends the page it sits on. In the paginated preview and in print this is the
// break itself; in the editing canvas it is the dashed line that shows where the
// break will fall, because a flowing canvas has no pages to show.
const Break = styled(Box)`
  break-after: page;
  page-break-after: always;

  @media print {
    border: none;
  }
`;

const PageBreak = () => (
  <Break
    w="100%"
    my="12px"
    borderTop={`1px dashed ${colors.borderDark}`}
    className="e2e-page-break"
  >
    <Text
      m="0"
      pt="4px"
      fontSize="xs"
      color="textSecondary"
      textAlign="center"
      className="e2e-page-break-label"
    >
      <FormattedMessage {...messages.pageBreak} />
    </Text>
  </Break>
);

PageBreak.craft = {
  props: {},
  custom: {
    title: messages.pageBreak,
  },
};

export const pageBreakTitle = messages.pageBreak;

export default PageBreak;
