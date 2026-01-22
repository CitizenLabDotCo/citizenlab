import React, { ChangeEvent, useState, MouseEvent } from 'react';

import { Box, colors, Td, Badge } from '@citizenlab/cl2-component-library';
import { uniq, isEmpty } from 'lodash-es';
import { useDrag } from 'react-dnd';
import { CellConfiguration, SupportedLocale, Override } from 'typings';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IIdeaData } from 'api/ideas/types';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useIdeasPhases from 'api/ideas_phases/useIdeasPhases';
import { IPhaseData } from 'api/phases/types';

import usePostManagerColumnFilter from 'hooks/usePostManagerColumnFilter';

import AssigneeSelect from 'components/admin/PostManager/components/PostTable/AssigneeSelect';
import FeatureFlag from 'components/FeatureFlag';
import T from 'components/T';
import Checkbox from 'components/UI/Checkbox';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { timeAgo } from 'utils/dateUtils';
import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';

import { TFilterMenu, ManagerType } from '../../..';
import FormattedBudget from '../../../../../../utils/currency/FormattedBudget';
import messages from '../../../messages';
import tracks from '../../../tracks';
import IdeaOfficialFeedbackModal, {
  getIdeaOfficialFeedbackModalEventName,
} from '../../IdeaOfficialFeedbackModal';

import LikeIndicator from './LikeIndicator';
import PhaseDeselectModal from './PhaseDeselectModal';
import StyledRow from './StyledRow';
import SubRow from './SubRow';
import { getRemovedPhase, ideaHasVotesInPhase } from './utils';

import { TitleLink } from '.';

type Props = {
  type: ManagerType;
  idea: IIdeaData;
  phases?: IPhaseData[];
  statuses?: IIdeaStatusData[];
  selectedPhaseId?: string | null;
  selectedProjectId?: string | null;
  /** A set of ids of ideas that are currently selected */
  selection: Set<string>;
  activeFilterMenu: TFilterMenu;
  className?: string;
  onClickCheckbox: (event) => void;
  onClickTitle: (event: MouseEvent) => void;
  locale: SupportedLocale;
};

export type IdeaCellComponentProps = {
  idea: IIdeaData;
  selection: Set<string>;
  onChange?: (event: unknown) => void;
  onClick?: (event: unknown) => void;
};

const IdeaRow = ({
  onClickCheckbox,
  onClickTitle,
  className,
  activeFilterMenu,
  phases,
  statuses,
  selectedPhaseId,
  idea,
  selection,
  locale,
  type,
}: Props) => {
  const { formatMessage } = useIntl();
  const ideasPhases = useIdeasPhases(
    idea.relationships.ideas_phases.data.map((relation) => relation.id)
  );
  const [phasesToBeSelected, setPhasesToBeSeselected] = useState<
    string[] | null
  >(null);

  const phaseDeselectModalOpen = !!phasesToBeSelected;
  const closePhaseDeselectModal = () => setPhasesToBeSeselected(null);

  const { mutate: updateIdea, isLoading: updatingIdea } = useUpdateIdea();

  const handleConfirmDeselectPhase = () => {
    updateIdea({ id: idea.id, requestBody: { phase_ids: phasesToBeSelected } });
    closePhaseDeselectModal();
  };

  const cells = [
    {
      name: 'selection',
      cellProps: { collapsing: true },
      onChange: onClickCheckbox,
      Component: ({
        selection,
        idea,
        onChange,
      }: Override<
        IdeaCellComponentProps,
        {
          onChange: (event: ChangeEvent<HTMLInputElement>) => void;
        }
      >) => {
        return (
          <Checkbox
            checked={!!selection.has(idea.id)}
            onChange={onChange}
            size="21px"
          />
        );
      },
    },
    {
      name: 'title',
      onClick: onClickTitle,
      Component: ({ idea, onClick }: IdeaCellComponentProps) => {
        const wasImported = !!idea.relationships.idea_import?.data;

        return (
          <>
            <TitleLink
              className="e2e-idea-manager-idea-title intercom-admin-input-manager-title"
              onClick={onClick}
            >
              <T value={idea.attributes.title_multiloc} />
            </TitleLink>
            {wasImported && (
              <Badge color={colors.coolGrey700}>
                {formatMessage(messages.imported)}
              </Badge>
            )}
          </>
        );
      },
    },
    {
      name: 'assignee',
      cellProps: {
        onClick: (event: Event) => {
          event.preventDefault();
          event.stopPropagation();
        },
        singleLine: true,
      },
      onChange: (idea: IIdeaData) => (assigneeId: string | undefined) => {
        const ideaId = idea.id;

        updateIdea({
          id: ideaId,
          requestBody: { assignee_id: assigneeId || null },
        });

        trackEventByName(tracks.changeIdeaAssignment, {
          location: 'Idea Manager',
          method: 'Changed through the dropdown n the table overview',
          idea: ideaId,
        });
      },
      Component: ({
        idea,
        onChange,
      }: Override<
        IdeaCellComponentProps,
        {
          onChange: (idea: IIdeaData) => (assigneeId?: string) => void;
        }
      >) => {
        const projectId = idea.relationships.project.data.id;
        return (
          <AssigneeSelect
            onAssigneeChange={onChange(idea)}
            projectId={projectId}
            assigneeId={idea.relationships.assignee?.data?.id}
          />
        );
      },
    },
    {
      name: 'votes',
      Component: ({ idea }: IdeaCellComponentProps) => {
        return <>{idea.attributes.votes_count}</>;
      },
    },
    {
      name: 'offline_votes',
      Component: ({ idea }: IdeaCellComponentProps) => {
        return <>{idea.attributes.manual_votes_amount || 0}</>;
      },
    },
    {
      name: 'picks',
      Component: ({ idea }: IdeaCellComponentProps) => {
        return <>{idea.attributes.baskets_count}</>;
      },
    },
    {
      name: 'offline_picks',
      Component: ({ idea }: IdeaCellComponentProps) => {
        return <>{idea.attributes.manual_votes_amount || 0}</>;
      },
    },
    {
      name: 'participants',
      Component: ({ idea }: IdeaCellComponentProps) => {
        return <>{idea.attributes.baskets_count}</>;
      },
    },
    {
      name: 'budget',
      Component: ({ idea }: IdeaCellComponentProps) => {
        return <FormattedBudget value={idea.attributes.budget || 0} />;
      },
    },
    {
      name: 'comments',
      Component: ({ idea }: IdeaCellComponentProps) => {
        return <>{idea.attributes.comments_count}</>;
      },
    },
    {
      name: 'up',
      Component: ({ idea }: IdeaCellComponentProps) => {
        return (
          <LikeIndicator
            likeCount={idea.attributes.likes_count}
            iconName="vote-up"
          />
        );
      },
    },
    ...(type !== 'ProjectProposals'
      ? [
          {
            name: 'down',
            Component: ({ idea }: IdeaCellComponentProps) => {
              return (
                <LikeIndicator
                  likeCount={idea.attributes.dislikes_count}
                  iconName="vote-down"
                />
              );
            },
          },
        ]
      : []),
    {
      name: 'published_on',
      Component: ({ idea }) => {
        if (!isNilOrError(locale)) {
          return (
            <>{timeAgo(Date.parse(idea.attributes.published_at), locale)}</>
          );
        }
        return null;
      },
    },
  ];

  const currentPhases = idea.relationships.phases.data.map((d) => d.id);

  const [_collected, drag] = useDrag({
    type: 'IDEA',
    item: {
      type: 'idea',
      id: idea.id,
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<{
        type: 'status' | 'project' | 'phase' | 'topic';
        id: string;
      }>();
      const itemIdeaId = item.id;

      if (dropResult && dropResult.type === 'status') {
        selection.has(itemIdeaId) &&
          selection.forEach((ideaId) => {
            updateIdea({
              id: ideaId,
              requestBody: {
                idea_status_id: dropResult.id,
              },
            });
          });

        !selection.has(itemIdeaId) &&
          updateIdea({
            id: itemIdeaId,
            requestBody: {
              idea_status_id: dropResult.id,
            },
          });

        trackEventByName(tracks.ideaStatusChange, {
          location: 'Idea overview',
          method: 'Dragged and dropped idea(s) in manager',
        });
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (dropResult && dropResult.type) {
        const ideaIds = selection.has(item.id)
          ? [...selection].map((id) => id)
          : [item.id];

        if (dropResult.type === 'topic') {
          const currentTopics = idea.relationships.input_topics?.data.map(
            (d) => d.id
          );
          const newTopics = uniq(currentTopics?.concat(dropResult.id));

          ideaIds.forEach((ideaId) => {
            updateIdea({
              id: ideaId,
              requestBody: {
                topic_ids: newTopics,
              },
            });
          });
        }

        if (dropResult.type === 'phase') {
          const newPhases = uniq(currentPhases.concat(dropResult.id));

          ideaIds.forEach((ideaId) => {
            updateIdea({
              id: ideaId,
              requestBody: {
                phase_ids: newPhases,
              },
            });
          });
        }

        if (dropResult.type === 'project') {
          const newProject = dropResult.id;
          const hasPhases = !isEmpty(idea.relationships.phases.data);

          ideaIds.forEach((ideaId) => {
            if (
              !hasPhases || // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              (hasPhases &&
                window.confirm(
                  formatMessage(messages.loseIdeaPhaseInfoConfirmation)
                ))
            ) {
              updateIdea({
                id: ideaId,
                requestBody: {
                  project_id: newProject,
                  phase_ids: [],
                },
              });
            }
          });
        }
      }
    },
  });

  const selectedPhases = idea.relationships.phases.data.map((p) => p.id);
  const selectedTopics = idea.relationships.input_topics?.data.map((p) => p.id);
  const active = selection.has(idea.id);
  const projectId = idea.relationships.project.data.id;
  const selectedStatus = idea.relationships.idea_status.data?.id;
  const displayColumns = usePostManagerColumnFilter(selectedPhaseId);

  const renderCell = (
    { idea, selection }: IdeaCellComponentProps,
    {
      name,
      Component,
      onChange,
      onClick,
      featureFlag,
    }: CellConfiguration<IdeaCellComponentProps>
  ) => {
    const handlers = {
      ...(onChange ? { onChange } : {}),
      ...(onClick ? { onClick } : {}),
    };

    const Content =
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      displayColumns && !displayColumns.has(name) ? null : (
        <Td key={name} borderBottom="none !important">
          <Box
            {...(['up', 'down'].includes(name)
              ? { display: 'flex', flexDirection: 'row' }
              : {})}
          >
            <Component idea={idea} selection={selection} {...handlers} />
          </Box>
        </Td>
      );

    if (!featureFlag) return Content;
    return (
      <FeatureFlag name={featureFlag} key={name}>
        {Content}
      </FeatureFlag>
    );
  };

  const onUpdateIdeaPhases = (selectedPhases: string[]) => {
    const removedPhaseId = getRemovedPhase(selectedPhases, currentPhases);

    if (removedPhaseId && ideaHasVotesInPhase(removedPhaseId, ideasPhases)) {
      setPhasesToBeSeselected(selectedPhases);
    } else {
      updateIdea({ id: idea.id, requestBody: { phase_ids: selectedPhases } });
    }
  };

  const onUpdateIdeaTopics = (selectedTopics: string[]) => {
    updateIdea({ id: idea.id, requestBody: { topic_ids: selectedTopics } });
  };

  const onUpdateIdeaStatus = (statusId: string) => {
    const ideaId = idea.id;

    updateIdea({ id: ideaId, requestBody: { idea_status_id: statusId } });

    trackEventByName(tracks.ideaStatusChange, {
      location: 'Idea overview',
      method: 'Clicked on the squares representing the statuses',
      idea: ideaId,
    });

    eventEmitter.emit(getIdeaOfficialFeedbackModalEventName(ideaId));
  };

  return (
    <>
      <StyledRow
        className={`${className} e2e-idea-manager-idea-row`}
        undraggable={false}
        background={active ? colors.grey300 : undefined}
        ref={drag}
      >
        {cells.map((cellConfiguration) =>
          renderCell({ idea, selection }, cellConfiguration)
        )}
      </StyledRow>
      <SubRow
        {...{
          active,
          className,
          activeFilterMenu,
          selectedPhases,
          phases,
          selectedTopics,
          projectId,
          statuses,
          selectedStatus,
        }}
        onUpdatePhases={onUpdateIdeaPhases}
        onUpdateTopics={onUpdateIdeaTopics}
        onUpdateStatus={onUpdateIdeaStatus}
      />
      <PhaseDeselectModal
        open={phaseDeselectModalOpen}
        isLoading={updatingIdea}
        onClose={closePhaseDeselectModal}
        onConfirm={handleConfirmDeselectPhase}
      />
      <IdeaOfficialFeedbackModal ideaId={idea.id} />
    </>
  );
};

export default IdeaRow;
