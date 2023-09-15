import React, { ChangeEvent, useState, MouseEvent } from 'react';
import { uniq, isEmpty } from 'lodash-es';
import { useDrag } from 'react-dnd';
// services
import { IPhaseData } from 'api/phases/types';
import { IIdeaData } from 'api/ideas/types';
import { IIdeaStatusData } from 'api/idea_statuses/types';

// components
import { TitleLink } from '.';
import { Box, colors, Td, Badge } from '@citizenlab/cl2-component-library';
import StyledRow from './StyledRow';
import SubRow from './SubRow';
import { Icon } from 'semantic-ui-react';
import T from 'components/T';
import Outlet from 'components/Outlet';
import Checkbox from 'components/UI/Checkbox';
import FeatureFlag from 'components/FeatureFlag';

// utils
import { timeAgo } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from '../../../messages';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../../../tracks';
import { TFilterMenu, ManagerType } from '../../..';
import {
  CellConfiguration,
  InsertConfigurationOptions,
  Locale,
  Override,
} from 'typings';
import { insertConfiguration } from 'utils/moduleUtils';

// hooks
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import usePostManagerColumnFilter from 'hooks/usePostManagerColumnFilter';
import FormattedBudget from '../../../../../../utils/currency/FormattedBudget';

type Props = {
  type: ManagerType;
  idea: IIdeaData;
  phases?: IPhaseData[];
  statuses?: IIdeaStatusData[];
  selectedPhaseId?: string | null;
  selectedProjectId?: string | null;
  /** A set of ids of ideas/initiatives that are currently selected */
  selection: Set<string>;
  activeFilterMenu: TFilterMenu;
  className?: string;
  onClickCheckbox: (event) => void;
  onClickTitle: (event: MouseEvent) => void;
  locale: Locale;
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
  selectedProjectId,
  idea,
  selection,
  locale,
}: Props) => {
  const { formatMessage } = useIntl();
  const [cells, setCells] = useState<
    CellConfiguration<IdeaCellComponentProps>[]
  >([
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
      Component: ({ idea, onClick }) => {
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
      name: 'votes',
      Component: ({ idea }: IdeaCellComponentProps) => {
        return <>{idea.attributes.votes_count}</>;
      },
    },
    {
      name: 'picks',
      Component: ({ idea }: IdeaCellComponentProps) => {
        return <>{idea.attributes.baskets_count}</>;
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
      Component: ({ idea }) => {
        return (
          <>
            <Icon name="thumbs up" />
            {idea.attributes.likes_count}
          </>
        );
      },
    },
    {
      name: 'down',
      Component: ({ idea }: IdeaCellComponentProps) => {
        return (
          <>
            <Icon name="thumbs down" />
            {idea.attributes.dislikes_count}
          </>
        );
      },
    },
    {
      name: 'published_on',
      Component: ({ idea }) => {
        if (!isNilOrError(locale)) {
          return <>{timeAgo(Date.parse(idea.attributes.created_at), locale)}</>;
        }
        return null;
      },
    },
  ]);

  const { mutate: updateIdea } = useUpdateIdea();
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
      } else if (dropResult && dropResult.type) {
        const ideaIds = selection.has(item.id)
          ? [...selection].map((id) => id)
          : [item.id];

        if (dropResult.type === 'topic') {
          const currentTopics = idea.relationships.topics?.data.map(
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
          const currentPhases = idea.relationships.phases.data.map((d) => d.id);
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
              !hasPhases ||
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

  const handleData = (
    insertCellOptions: InsertConfigurationOptions<
      CellConfiguration<IdeaCellComponentProps>
    >
  ) => {
    setCells((cells) => insertConfiguration(insertCellOptions)(cells));
  };

  const selectedPhases = idea.relationships.phases.data.map((p) => p.id);
  const selectedTopics = idea.relationships.topics?.data.map((p) => p.id);
  const active = selection.has(idea.id);
  const projectId = idea.relationships.project.data.id;
  const selectedStatus = idea.relationships.idea_status.data?.id;
  const displayColumns = usePostManagerColumnFilter(
    selectedProjectId,
    selectedPhaseId
  );

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
    updateIdea({ id: idea.id, requestBody: { phase_ids: selectedPhases } });
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
  };

  return (
    <>
      <Outlet
        id="app.components.admin.PostManager.components.PostTable.IdeaRow.cells"
        onData={handleData}
      />
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
        allowedTransitions={null}
        onUpdatePhases={onUpdateIdeaPhases}
        onUpdateTopics={onUpdateIdeaTopics}
        onUpdateStatus={onUpdateIdeaStatus}
        postType="idea"
      />
    </>
  );
};

export default IdeaRow;
