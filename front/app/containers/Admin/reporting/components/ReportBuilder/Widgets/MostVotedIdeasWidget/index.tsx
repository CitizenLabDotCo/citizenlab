import React from 'react';

// components
import Settings from './Settings';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// typings
import { Props } from './typings';

const MostVotedIdeasWidget = ({}: // TODO
Props) => {
  const { formatMessage } = useIntl();

  return <>{formatMessage(messages.mostVotedIdeas)}</>;
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
