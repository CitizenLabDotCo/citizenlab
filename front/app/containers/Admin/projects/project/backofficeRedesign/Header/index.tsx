import React from 'react';

import { Box, Tooltip, bo, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import Breadcrumbs, { TBreadcrumbs } from 'components/UI/Breadcrumbs';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import { ProjectSection } from '../_shared/sections';
import messages from '../messages';
import usePhaseViews, { PhaseViewKey } from '../Phase/usePhaseViews';
import ViewSwitch from '../Phase/ViewSwitch';

import { HeaderDropdownName } from './HeaderDropdown';
import PublishDropdown from './PublishDropdown';
import SaveChangesButton from './SaveChangesButton';
import ShareDropdown from './ShareDropdown';

const HEADER_HEIGHT = '48px';

const CrumbBar = styled(Box)`
  span {
    white-space: nowrap;
  }
`;

interface Props {
  project: IProjectData;
  phase?: IPhaseData;
  draftLabel?: string;
  draftParentLabel?: string;
  saveLabel?: string;
  activeView: PhaseViewKey;
  section?: ProjectSection;
  openDropdown: HeaderDropdownName | null;
  onOpenDropdown: (dropdown: HeaderDropdownName | null) => void;
}

const WorkspaceHeader = ({
  project,
  phase,
  draftLabel,
  draftParentLabel,
  saveLabel,
  activeView,
  section,
  openDropdown,
  onOpenDropdown,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const views = usePhaseViews(phase);
  const inPhase = !!(phase || draftLabel);

  const phaseCrumbs: TBreadcrumbs = [
    {
      label: localize(project.attributes.title_multiloc),
      link: {
        to: '/admin/projects/$projectId',
        params: { projectId: project.id },
      },
    },
    ...(draftParentLabel ? [{ label: draftParentLabel }] : []),
    ...(phase ? [{ label: localize(phase.attributes.title_multiloc) }] : []),
    ...(draftLabel ? [{ label: draftLabel }] : []),
  ];

  const projectCrumbs: TBreadcrumbs = [
    {
      label: formatMessage(messages.projectsCrumb),
      link: { to: '/admin/projects' },
    },
    {
      label: localize(project.attributes.title_multiloc),
      ...(section && {
        link: {
          to: '/admin/projects/$projectId' as const,
          params: { projectId: project.id },
        },
      }),
    },
    ...(section ? [{ label: formatMessage(section.label) }] : []),
  ];

  return (
    <Box
      as="header"
      display="flex"
      alignItems="center"
      flex={`0 0 ${HEADER_HEIGHT}`}
      height={HEADER_HEIGHT}
      pl="26px"
      pr="20px"
      background={colors.white}
      borderRadius={bo.panelBorderRadius}
    >
      <CrumbBar
        flex="1 1 0"
        minWidth="0"
        overflow="hidden"
        display="flex"
        alignItems="center"
        gap="12px"
      >
        {inPhase ? (
          <>
            <ButtonWithLink
              to="/admin/projects/$projectId"
              params={{ projectId: project.id }}
              buttonStyle="bo-secondary"
              icon="arrow-left"
              width={bo.buttonMedium.height}
              height={bo.buttonMedium.height}
              padding="0"
              ariaLabel={formatMessage(messages.backToProjectSetup)}
            />
            <Breadcrumbs
              breadcrumbs={phaseCrumbs}
              separator={draftParentLabel ? 'chevron' : 'slash'}
              variant="backofficeRedesign"
              highlightCurrentPage
            />
          </>
        ) : (
          <Breadcrumbs
            breadcrumbs={projectCrumbs}
            icon="folder-outline"
            separator="chevron"
            variant="backofficeRedesign"
            highlightCurrentPage
          />
        )}
      </CrumbBar>

      <Box flex="0 0 auto">
        {phase && (
          <ViewSwitch
            views={views}
            activeView={activeView}
            projectId={project.id}
            phaseId={phase.id}
          />
        )}
      </Box>

      <Box
        flex="1 1 0"
        display="flex"
        alignItems="center"
        justifyContent="flex-end"
        gap="8px"
      >
        {inPhase ? (
          <SaveChangesButton label={saveLabel} />
        ) : (
          <>
            <Tooltip
              content={formatMessage(messages.previewProject)}
              theme="dark"
              placement="bottom"
            >
              <ButtonWithLink
                to="/projects/$slug"
                params={{ slug: project.attributes.slug }}
                buttonStyle="bo-text"
                icon="eye"
                width={bo.buttonMedium.height}
                height={bo.buttonMedium.height}
                padding="0"
                bgHoverColor={colors.grey100}
                iconHoverColor={colors.textPrimary}
                ariaLabel={formatMessage(messages.previewProject)}
              />
            </Tooltip>
            <Box position="relative" display="flex" gap="8px">
              <ShareDropdown
                project={project}
                opened={openDropdown === 'share'}
                onOpenChange={(opened) =>
                  onOpenDropdown(opened ? 'share' : null)
                }
              />
              <PublishDropdown
                project={project}
                opened={openDropdown === 'publish'}
                onOpenChange={(opened) =>
                  onOpenDropdown(opened ? 'publish' : null)
                }
              />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default WorkspaceHeader;
