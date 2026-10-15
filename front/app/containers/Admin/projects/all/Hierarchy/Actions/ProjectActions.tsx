import React from 'react';

import { useIntl } from 'utils/cl-intl';

import MoreActions from '../Menu/MoreActions';
import messages from '../messages';

interface Props {
  projectId: string;
}

// A project's "⋯". Everyone sees only projects they manage, so everyone can
// edit the ones listed.
const ProjectActions = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <MoreActions
      entries={[
        {
          key: 'edit',
          icon: 'edit',
          label: formatMessage(messages.editProject),
          link: {
            to: '/admin/projects/$projectId/general',
            params: { projectId },
          },
        },
      ]}
    />
  );
};

export default ProjectActions;
