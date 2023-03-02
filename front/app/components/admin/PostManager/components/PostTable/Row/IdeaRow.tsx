import React, { ChangeEvent, useState, MouseEvent } from 'react';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';
import { uniq, isEmpty } from 'lodash-es';
import { useDrag } from 'react-dnd';
// services
import { IIdeaData, ideaByIdStream } from 'services/ideas';
import { IPhaseData } from 'services/phases';
import { IIdeaStatusData } from 'api/idea_statuses/types';
import streams from 'utils/streams';

// components
import { TitleLink } from '.';
import { Box, colors, Td } from '@citizenlab/cl2-component-library';
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

type Props = {
  type: ManagerType;
  idea: IIdeaData;
  phases?: IPhaseData[];
  statuses?: IIdeaStatusData[];
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
  idea,
  selection,
  locale,
}: Props) => {
  const { formatMessage } = useIntl();
  const onSuccess = (ideaId: string) => () => {
    streams.fetchAllWith({
      dataId: [ideaId],
    });
  };
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
        return (
          <TitleLink
            className="e2e-idea-manager-idea-title intercom-admin-input-manager-title"
            onClick={onClick}
          >
            <T value={idea.attributes.title_multiloc} />
          </TitleLink>
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
    {
      name: 'up',
      cellProps: { singleLine: true },
      Component: ({ idea }) => {
        return (
          <>
            <Icon name="thumbs up" />
            {idea.attributes.upvotes_count}
          </>
        );
      },
    },
    {
      name: 'down',
      cellProps: { singleLine: true },
      Component: ({ idea }: IdeaCellComponentProps) => {
        return (
          <>
            <Icon name="thumbs down" />
            {idea.attributes.downvotes_count}
          </>
        );
      },
    },
    {
      name: 'picks',
      cellProps: { singleLine: true },
      featureFlag: 'participatory_budgeting',
      Component: ({ idea }: IdeaCellComponentProps) => {
        return <>{idea.attributes.baskets_count}</>;
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
            updateIdea(
              {
                id: ideaId,
                requestBody: {
                  idea_status_id: dropResult.id,
                },
              },
              {
                onSuccess: onSuccess(ideaId),
              }
            );
          });

        !selection.has(itemIdeaId) &&
          updateIdea(
            {
              id: itemIdeaId,
              requestBody: {
                idea_status_id: dropResult.id,
              },
            },
            {
              onSuccess: onSuccess(itemIdeaId),
            }
          );

        trackEventByName(tracks.ideaStatusChange, {
          location: 'Idea overview',
          method: 'Dragged and dropped idea(s) in manager',
        });
      } else if (dropResult && dropResult.type) {
        const observables = selection.has(item.id)
          ? [...selection].map((id) => ideaByIdStream(id).observable)
          : [ideaByIdStream(item.id).observable];

        if (dropResult.type === 'topic') {
          combineLatest(observables)
            .pipe(take(1))
            .subscribe((ideas) => {
              ideas.map((idea) => {
                const currentTopics = idea.data.relationships.topics?.data.map(
                  (d) => d.id
                );
                const newTopics = uniq(currentTopics?.concat(dropResult.id));
                updateIdea(
                  {
                    id: idea.data.id,
                    requestBody: {
                      topic_ids: newTopics,
                    },
                  },
                  {
                    onSuccess: onSuccess(idea.data.id),
                  }
                );
              });
            });
        }

        if (dropResult.type === 'phase') {
          combineLatest(observables)
            .pipe(take(1))
            .subscribe((ideas) => {
              ideas.map((idea) => {
                const currentPhases = idea.data.relationships.phases.data.map(
                  (d) => d.id
                );
                const newPhases = uniq(currentPhases.concat(dropResult.id));
                updateIdea(
                  {
                    id: idea.data.id,
                    requestBody: {
                      phase_ids: newPhases,
                    },
                  },
                  {
                    onSuccess: onSuccess(idea.data.id),
                  }
                );
              });
            });
        }

        if (dropResult.type === 'project') {
          combineLatest(observables)
            .pipe(take(1))
            .subscribe((ideas) => {
              ideas.map((idea) => {
                const newProject = dropResult.id;
                const hasPhases = !isEmpty(idea.data.relationships.phases.data);
                const onUpdateIdea = () => {
                  updateIdea(
                    {
                      id: idea.data.id,
                      requestBody: {
                        project_id: newProject,
                        phase_ids: [],
                      },
                    },
                    {
                      onSuccess: onSuccess(idea.data.id),
                    }
                  );
                };

                if (hasPhases) {
                  const message = formatMessage(
                    messages.loseIdeaPhaseInfoConfirmation
                  );

                  if (window.confirm(message)) {
                    onUpdateIdea();
                  }
                } else {
                  onUpdateIdea();
                }
              });
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
  const selectedStatus = idea.relationships.idea_status.data.id;

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

    const Content = (
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
    updateIdea(
      { id: idea.id, requestBody: { phase_ids: selectedPhases } },
      {
        onSuccess: onSuccess(idea.id),
      }
    );
  };

  const onUpdateIdeaTopics = (selectedTopics: string[]) => {
    updateIdea(
      { id: idea.id, requestBody: { topic_ids: selectedTopics } },
      {
        onSuccess: onSuccess(idea.id),
      }
    );
  };

  const onUpdateIdeaStatus = (statusId: string) => {
    const ideaId = idea.id;

    updateIdea(
      { id: ideaId, requestBody: { idea_status_id: statusId } },
      {
        onSuccess: onSuccess(idea.id),
      }
    );

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
