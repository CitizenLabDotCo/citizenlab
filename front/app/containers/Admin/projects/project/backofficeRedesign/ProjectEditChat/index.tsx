import React, { useState } from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import { useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';

import customFieldsKeys from 'api/custom_fields/keys';
import customFormKeys from 'api/custom_form/keys';
import phasesKeys from 'api/phases/keys';
import projectPageLayoutKeys from 'api/project_page_layout/keys';
import useAddProjectGeneration from 'api/project_generations/useAddProjectGeneration';
import projectsKeys from 'api/projects/keys';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';
import useLocale from 'hooks/useLocale';

import DraftingProgress from '../ProjectAssistantModal/DraftingProgress';
import GenerationWatcher from '../ProjectAssistantModal/GenerationWatcher';
import ModalComposer from '../ProjectAssistantModal/ModalComposer';
import { DEFAULT_LEVERS } from '../ProjectAssistant/leverConfig';

// The persistent "chat to change anything" entry in the project setup
// workspace. It reuses the real generation engine: a change is a redraft of the
// whole project with the manager's direction, and the workspace preview
// refreshes when it lands. (Targeted, undoable edits are the convergence with
// the approval-gated assistant framework — this is the honest first step: it
// redraws the draft, it does not patch one field.)

const INTRO =
  'Want a change? Describe it and I’ll redraft the project with it. This replaces the current draft.';

const SUGGESTIONS = [
  'Make the introduction shorter and punchier',
  'Add one more phase before the final one',
  'Make the survey shorter',
];

const Bar = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 999px;
  border: 1px solid ${colors.grey300};
  background: ${colors.white};
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  font: inherit;
  color: ${colors.grey600};
  min-width: 320px;
  &:hover {
    border-color: ${colors.teal400};
  }
`;

const Panel = styled.div`
  width: 520px;
  max-width: calc(100vw - 48px);
  max-height: 72vh;
  display: flex;
  flex-direction: column;
  background: ${colors.white};
  border: 1px solid ${colors.grey300};
  border-radius: 16px;
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.22);
  overflow: hidden;
`;

type Props = { project: IProjectData };

const ProjectEditChat = ({ project }: Props) => {
  const projectId = project.id;
  const locale = useLocale();
  const localize = useLocalize();
  const queryClient = useQueryClient();
  const { mutateAsync: addProjectGeneration } = useAddProjectGeneration();

  const [open, setOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [jobStartedAt, setJobStartedAt] = useState<string>();
  const [error, setError] = useState<string>();
  const [exchanges, setExchanges] = useState<{ user: string; assistant?: string }[]>([]);

  const title = localize(project.attributes.title_multiloc);
  const preview = localize(project.attributes.description_preview_multiloc);

  const refreshWorkspace = () => {
    queryClient.invalidateQueries({ queryKey: projectsKeys.item({ id: projectId }) });
    queryClient.invalidateQueries({ queryKey: phasesKeys.all() });
    queryClient.invalidateQueries({ queryKey: projectPageLayoutKeys.all() });
    queryClient.invalidateQueries({ queryKey: customFieldsKeys.all() });
    queryClient.invalidateQueries({ queryKey: customFormKeys.all() });
  };

  const send = async (direction: string) => {
    setError(undefined);
    setExchanges((prev) => [...prev, { user: direction }]);
    try {
      const context = [
        `This is an existing project titled "${title}".`,
        preview ? `Its summary: ${preview}` : '',
        'Please revise the whole project with this direction:',
        direction,
      ]
        .filter(Boolean)
        .join('\n');
      await addProjectGeneration({
        projectId,
        prompt: context,
        locale,
        fileIds: [],
        levers: DEFAULT_LEVERS,
      });
      setJobStartedAt(new Date().toISOString());
      setRegenerating(true);
    } catch {
      setError('Something went wrong with that change. Please try again.');
    }
  };

  const onComplete = (succeeded: boolean) => {
    refreshWorkspace();
    setRegenerating(false);
    setExchanges((prev) => {
      const last = prev[prev.length - 1];
      if (last && !last.assistant) {
        return [
          ...prev.slice(0, -1),
          {
            ...last,
            assistant: succeeded
              ? 'Done — I’ve redrafted the project. The preview is updated.'
              : 'I’ve redrafted most of it; one or two parts may need a look.',
          },
        ];
      }
      return prev;
    });
  };

  return (
    <Box position="absolute" bottom="20px" left="0" right="0" display="flex" justifyContent="center" zIndex="20">
      {regenerating && jobStartedAt && (
        <GenerationWatcher projectId={projectId} since={jobStartedAt} onComplete={onComplete} />
      )}

      {!open ? (
        <Bar type="button" onClick={() => setOpen(true)}>
          <Icon name="stars" width="18px" height="18px" fill={colors.teal500} />
          Chat to change anything
        </Bar>
      ) : (
        <Panel>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            p="14px 18px"
            borderBottom={`1px solid ${colors.grey200}`}
            flex="0 0 auto"
          >
            <Box display="flex" alignItems="center" gap="10px" minWidth="0">
              <Icon name="stars" width="18px" height="18px" fill={colors.teal500} />
              <Box minWidth="0">
                <Text m="0px" fontWeight="bold" color="textPrimary">
                  Project assistant
                </Text>
                <Text m="0px" fontSize="s" color="textSecondary" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
                  {title}
                </Text>
              </Box>
            </Box>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'inline-flex' }}
              aria-label="Collapse"
            >
              <Icon name="chevron-down" width="18px" height="18px" fill={colors.textSecondary} />
            </button>
          </Box>

          <Box flex="1" minHeight="0" overflowY="auto" p="16px 18px" display="flex" flexDirection="column" gap="14px">
            <Text m="0px" color="textSecondary" lineHeight="1.5">
              {INTRO}
            </Text>

            {exchanges.map((exchange, i) => (
              <React.Fragment key={i}>
                <Box display="flex" justifyContent="flex-end">
                  <Box maxWidth="85%" p="10px 14px" borderRadius="14px 14px 4px 14px" bgColor={colors.grey100}>
                    <Text m="0px" color="textPrimary" lineHeight="1.5">
                      {exchange.user}
                    </Text>
                  </Box>
                </Box>
                {exchange.assistant && (
                  <Text m="0px" color="textPrimary" lineHeight="1.55">
                    {exchange.assistant}
                  </Text>
                )}
              </React.Fragment>
            ))}

            {regenerating && jobStartedAt && <DraftingProgress startedAt={jobStartedAt} />}

            {!regenerating && exchanges.length === 0 && (
              <Box display="flex" flexWrap="wrap" gap="8px">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    style={{
                      appearance: 'none',
                      border: `1px solid ${colors.grey300}`,
                      background: colors.white,
                      borderRadius: '999px',
                      padding: '8px 14px',
                      font: 'inherit',
                      fontSize: '14px',
                      color: colors.textPrimary,
                      cursor: 'pointer',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </Box>
            )}

            {error && (
              <Text m="0px" color="error">
                {error}
              </Text>
            )}
          </Box>

          <Box flex="0 0 auto" p="12px 18px 16px" borderTop={`1px solid ${colors.grey200}`}>
            <ModalComposer placeholder="Describe a change…" disabled={regenerating} onSend={send} />
          </Box>
        </Panel>
      )}
    </Box>
  );
};

export default ProjectEditChat;
