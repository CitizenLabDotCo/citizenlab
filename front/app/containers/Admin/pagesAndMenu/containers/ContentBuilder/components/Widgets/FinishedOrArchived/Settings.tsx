import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

// import { FormattedMessage } from 'utils/cl-intl';

import TitleMultilocInput from '../_shared/TitleMultilocInput';

// import messages from './messages';

const Settings = () => {
  const {
    actions: { setProp },
    finished,
    archived,
  } = useNode((node) => ({
    finished: node.data.props.finished,
    archived: node.data.props.archived,
  }));

  console.log({ finished, archived });

  return (
    <Box my="20px">
      {/* <Text mb="32px" color="textSecondary">
        <FormattedMessage {...messages.thisWidgetShows} formatBold />
      </Text> */}
      <TitleMultilocInput name="finished_or_archived_title" />
    </Box>
  );
};

export default Settings;
