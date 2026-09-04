import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import Breadcrumbs, { TBreadcrumbs } from 'components/UI/Breadcrumbs';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import PublicationButtons from '../../projectHeader/PublicationButtons';
import ShareLink from '../../projectHeader/ShareLink';

import messages from './messages';
import usePhaseViews, { PhaseViewKey } from './Phase/usePhaseViews';
import ViewSwitch from './Phase/ViewSwitch';

export const HEADER_HEIGHT = '48px';

interface Props {
  project: IProjectData;
  phase?: IPhaseData;
  activeView: PhaseViewKey;
}

const WorkspaceHeader = ({ project, phase, activeView }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const views = usePhaseViews(phase);

  const crumbs: TBreadcrumbs = [
    {
      label: formatMessage(messages.projectsCrumb),
      link: { to: '/admin/projects' },
    },
    {
      label: localize(project.attributes.title_multiloc),
      ...(phase && {
        link: {
          to: '/admin/projects/$projectId' as const,
          params: { projectId: project.id },
        },
      }),
    },
    ...(phase ? [{ label: localize(phase.attributes.title_multiloc) }] : []),
  ];

  return (
    <Box
      as="header"
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      flex={`0 0 ${HEADER_HEIGHT}`}
      height={HEADER_HEIGHT}
      px="16px"
      background={colors.white}
      borderBottom={`1px solid ${colors.grey200}`}
    >
      <Breadcrumbs
        breadcrumbs={crumbs}
        icon="folder-outline"
        separator="chevron"
      />

      {phase && (
        <Box
          position="absolute"
          left="50%"
          style={{ transform: 'translateX(-50%)' }}
        >
          <ViewSwitch
            views={views}
            activeView={activeView}
            projectId={project.id}
            phaseId={phase.id}
          />
        </Box>
      )}

      <Box display="flex" alignItems="center" gap="10px">
        <ButtonWithLink
          to="/projects/$slug"
          params={{ slug: project.attributes.slug }}
          buttonStyle="secondary-outlined"
          icon="eye"
          size="s"
          padding="4px 8px"
        />
        <ShareLink
          projectId={project.id}
          projectSlug={project.attributes.slug}
          token={project.attributes.preview_token}
        />
        <PublicationButtons project={project} />
      </Box>
    </Box>
  );
};

export default WorkspaceHeader;
