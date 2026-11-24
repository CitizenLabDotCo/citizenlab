import React from 'react';

import { IProjectData } from 'api/projects/types';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import projectSetupPanelMessages from '../messages';
import SetupCard from '../SetupCard';
import { SetupReadiness } from '../useSetupReadiness';

import AreaCard from './AreaCard';
import HomepageCardFields from './HomepageCardFields';
import messages from './messages';
import TopicTagsCard from './TopicTagsCard';

interface Props {
  project: IProjectData;
  readiness?: SetupReadiness;
  onOpenSettings: () => void;
}

const SetupCards = ({ project, readiness, onOpenSettings }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <SetupCard
        id="e2e-setup-card-general"
        tooltip={formatMessage(messages.generalTooltip)}
        title={formatMessage(messages.settingsTitle)}
        ready={readiness?.general}
        behaviour={{
          kind: 'action',
          icon: 'chevron-right-16',
          actionLabel: formatMessage(projectSetupPanelMessages.projectSettings),
          onClick: onOpenSettings,
        }}
      />
      <SetupCard
        id="e2e-setup-card-homepage-card"
        tooltip={formatMessage(messages.homepageCardTooltip)}
        title={formatMessage(messages.projectCardTitle)}
        ready={readiness?.homepageCard}
        behaviour={{
          kind: 'expand',
          children: <HomepageCardFields project={project} />,
        }}
      />
      <AreaCard ready={readiness?.area} />
      <TopicTagsCard ready={readiness?.topics} />
      <SetupCard
        id="e2e-setup-card-project-page"
        tooltip={formatMessage(messages.projectPageTooltip)}
        title={formatMessage(messages.editProjectPage)}
        ready={readiness?.page}
        behaviour={{
          kind: 'action',
          icon: 'chevron-right-16',
          actionLabel: formatMessage(messages.editProjectPage),
          onClick: () =>
            clHistory.push(
              `/admin/project-page-builder/projects/${project.id}`
            ),
        }}
      />
    </>
  );
};

export default SetupCards;
