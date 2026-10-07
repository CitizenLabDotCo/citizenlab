import React, { useState } from 'react';

import { Box, Icon, Text, bo, colors } from '@citizenlab/cl2-component-library';

import usePhases from 'api/phases/usePhases';
import useProjectGenerationJob from 'api/project_generations/useProjectGenerationJob';
import { IProjectData } from 'api/projects/types';

import { HeaderDropdownName } from './Header/HeaderDropdown';
import ProjectAssistant from './ProjectAssistant';
import ProjectSetupPanel from './ProjectSetupPanel';

// The left column is the project-level setup area. The AI assistant is a
// project-setup tool (it drafts the whole project), so it lives here as a tab
// alongside the manual Setup checklist — not on the right, where method/phase
// editing happens. This component is only rendered for Premium (the
// ai_project_generator feature); without it, the workspace shows the plain
// Setup panel. Setup is always a tab, so even Premium can build from scratch.
type Tab = 'assistant' | 'setup';

// The assistant needs more room than the checklist (composer + shaping chips).
const WIDTHS: Record<Tab, string> = { assistant: '420px', setup: '332px' };

interface Props {
  project: IProjectData;
  onOpenDropdown: (dropdown: HeaderDropdownName) => void;
}

interface TabButtonProps {
  active: boolean;
  label: string;
  icon?: 'stars';
  onClick: () => void;
}

const TabButton = ({ active, label, icon, onClick }: TabButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      flex: '1 1 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      padding: '8px 10px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      background: active ? colors.teal50 : 'transparent',
    }}
  >
    {icon && (
      <Icon
        name={icon}
        width="16px"
        height="16px"
        fill={active ? colors.teal500 : colors.grey600}
      />
    )}
    <Text
      m="0px"
      fontSize="s"
      fontWeight={active ? 'bold' : 'normal'}
      color={active ? 'textPrimary' : 'textSecondary'}
    >
      {label}
    </Text>
  </button>
);

const SetupLeftPanel = ({ project, onOpenDropdown }: Props) => {
  const { data: phases } = usePhases(project.id);
  const { data: jobs } = useProjectGenerationJob(project.id);
  const [tab, setTab] = useState<Tab | null>(null);

  // A fresh, empty draft opens on the assistant (the "draft from a brief"
  // on-ramp). A project the assistant has drafted also opens on the assistant,
  // so the manager lands back on the chat (with its summary + review of what
  // was built) rather than on Setup once phases exist. Anything else opens on
  // Setup. The user's own tab choice always wins once made.
  const isEmptyDraft =
    project.attributes.publication_status === 'draft' &&
    phases !== undefined &&
    phases.data.length === 0;
  const hasGeneration = (jobs?.data.length ?? 0) > 0;
  const activeTab: Tab =
    tab ?? (isEmptyDraft || hasGeneration ? 'assistant' : 'setup');

  return (
    <Box
      flex={`0 0 ${WIDTHS[activeTab]}`}
      width={WIDTHS[activeTab]}
      minHeight="0"
      overflowY="auto"
      borderRadius={bo.panelBorderRadius}
      background={colors.white}
    >
      <Box
        display="flex"
        gap="4px"
        p="8px"
        borderBottom={`1px solid ${colors.grey200}`}
        position="sticky"
        top="0"
        background={colors.white}
        zIndex="1"
      >
        <TabButton
          active={activeTab === 'assistant'}
          label="Assistant"
          icon="stars"
          onClick={() => setTab('assistant')}
        />
        <TabButton
          active={activeTab === 'setup'}
          label="Setup"
          onClick={() => setTab('setup')}
        />
      </Box>

      {activeTab === 'assistant' ? (
        <ProjectAssistant project={project} />
      ) : (
        <ProjectSetupPanel project={project} onOpenDropdown={onOpenDropdown} />
      )}
    </Box>
  );
};

export default SetupLeftPanel;
