import React from 'react';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import Settings from './Settings';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { BORDER } from '../constants';

// typings
import { Props } from './typings';

const MostVotedIdeasWidget = ({
  title,
}: // TODO
Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box border={BORDER} mt="4px" mb="4px">
      <Box>
        <Title variant="h3" color="primary" m="16px" mb="8px">
          {title || formatMessage(messages.mostVotedIdeas)}
        </Title>
      </Box>
    </Box>
  );
};

MostVotedIdeasWidget.craft = {
  props: {
    title: undefined,
    projectId: undefined,
    phaseId: undefined,
    numberOfIdeas: 5,
    collapseLongText: false,
  },
  related: {
    settings: Settings,
  },
  custom: {
    title: messages.mostVotedIdeas,
  },
};

export default MostVotedIdeasWidget;
