import React, { ChangeEvent } from 'react';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';
import { uniq, isEmpty, get } from 'lodash-es';
import { findDOMNode } from 'react-dom';
import { DragSource } from 'react-dnd-cjs';

// services
import { IIdeaData, updateIdea, ideaByIdStream } from 'services/ideas';
import { IPhaseData } from 'services/phases';
import { IIdeaStatusData } from 'services/ideaStatuses';

// components
import { Table, Icon } from 'semantic-ui-react';
import WrappedRow from './WrappedRow';
import T from 'components/T';

import Checkbox from 'components/UI/Checkbox';
import FeatureFlag from 'components/FeatureFlag';

// utils
import localize, { InjectedLocalized } from 'utils/localize';

// i18n
import { FormattedRelative, InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from '../../messages';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../../tracks';
import { TFilterMenu, ManagerType } from '../..';
import { TitleLink, StyledRow } from './Row';
import SubRow from './SubRow';
import {
  CellConfiguration,
  InsertConfigurationOptions,
  Override,
} from 'typings';
import { insertConfiguration } from 'utils/moduleUtils';
import Outlet from 'components/Outlet';

type InputProps = {
  type: ManagerType;
  idea: IIdeaData;
  phases?: IPhaseData[];
  statuses?: IIdeaStatusData[];
  /** A set of ids of ideas/initiatives that are currently selected */
  selection: Set<string>;
  activeFilterMenu: TFilterMenu;
  className?: string;
  onClickCheckbox: (event) => void;
  onClickTitle: (event) => void;
  nothingHappens: (event) => void;
};

export type IdeaCellComponentProps = {
  idea: IIdeaData;
  selection: Set<string>;
  onChange?: (event: unknown) => void;
  onClick?: (event: unknown) => void;
};

type Props = InputProps & {
  connectDragSource: any;
};

type State = {
  cells: CellConfiguration<IdeaCellComponentProps>[];
};

class IdeaRow extends React.PureComponent<
  Props & InjectedIntlProps & InjectedLocalized,
  State
> {
  constructor(props) {
    super(props);

    const { onClickCheckbox, onClickTitle } = props;

    this.state = {
      cells: [
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
                className="e2e-idea-manager-idea-title"
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
            return <FormattedRelative value={idea.attributes.published_at} />;
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
      ],
    };
  }

  onUpdateIdeaPhases = (selectedPhases) => {
    updateIdea(this.props.idea.id, {
      phase_ids: selectedPhases,
    });
  };

  onUpdateIdeaTopics = (selectedTopics) => {
    updateIdea(this.props.idea.id, {
      topic_ids: selectedTopics,
    });
  };

  onUpdateIdeaStatus = (statusId) => {
    const { idea } = this.props;
    const ideaId = idea.id;

    updateIdea(ideaId, {
      idea_status_id: statusId,
    });

    trackEventByName(tracks.ideaStatusChange, {
      location: 'Idea overview',
      method: 'Clicked on the squares representing the statuses',
      idea: ideaId,
    });
  };

  renderCell = (
    { idea, selection }: IdeaCellComponentProps,
    {
      cellProps = {},
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
      <Table.Cell {...cellProps} key={name}>
        <Component idea={idea} selection={selection} {...handlers} />
      </Table.Cell>
    );

    if (!featureFlag) return Content;
    return (
      <FeatureFlag name={featureFlag} key={name}>
        {Content}
      </FeatureFlag>
    );
  };

  handleData = (
    insertCellOptions: InsertConfigurationOptions<
      CellConfiguration<IdeaCellComponentProps>
    >
  ) => {
    this.setState(({ cells }) => ({
      cells: insertConfiguration(insertCellOptions)(cells),
    }));
  };

  render() {
    const {
      idea,
      selection,
      connectDragSource,
      activeFilterMenu,
      phases,
      statuses,
      className,
    } = this.props;

    const { cells } = this.state;

    const selectedStatus: string | undefined = get(
      idea,
      'relationships.idea_status.data.id'
    );
    const selectedPhases = idea.relationships.phases.data.map((p) => p.id);
    const selectedTopics = idea.relationships.topics?.data.map((p) => p.id);
    const active = selection.has(idea.id);
    const projectId = get(idea, 'relationships.project.data.id');

    return (
      <>
        <Outlet
          id="app.components.admin.PostManager.components.PostTable.IdeaRow.cells"
          onData={this.handleData}
        />
        <WrappedRow
          className={`${className} e2e-idea-manager-idea-row`}
          as={StyledRow}
          active={active}
          ref={(instance) => {
            // eslint-disable-next-line react/no-find-dom-node
            instance && connectDragSource(findDOMNode(instance));
          }}
        >
          {cells.map((cellConfiguration) =>
            this.renderCell({ idea, selection }, cellConfiguration)
          )}
        </WrappedRow>
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
          onUpdatePhases={this.onUpdateIdeaPhases}
          onUpdateTopics={this.onUpdateIdeaTopics}
          onUpdateStatus={this.onUpdateIdeaStatus}
          postType="idea"
        />
      </>
    );
  }
}

const ideaSource = {
  beginDrag(props: Props) {
    return {
      type: 'idea',
      id: props.idea.id,
    };
  },
  endDrag(props: Props & InjectedIntlProps & InjectedLocalized, monitor) {
    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();
    const { selection } = props;

    if (dropResult && dropResult.type === 'status') {
      selection.has(item.id) &&
        selection.forEach((ideaId) => {
          updateIdea(ideaId, {
            idea_status_id: dropResult.id,
          });
        });

      !selection.has(item.id) &&
        updateIdea(item.id, {
          idea_status_id: dropResult.id,
        });

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
              updateIdea(idea.data.id, {
                topic_ids: newTopics,
              });
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
              updateIdea(idea.data.id, {
                phase_ids: newPhases,
              });
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

              if (hasPhases) {
                const ideaTitle = props.localize(
                  idea.data.attributes.title_multiloc
                );
                const message = props.intl.formatMessage(
                  messages.losePhaseInfoConfirmation,
                  { ideaTitle }
                );

                if (window.confirm(message)) {
                  updateIdea(idea.data.id, {
                    project_id: newProject,
                    phase_ids: [],
                  });
                }
              } else {
                updateIdea(idea.data.id, {
                  project_id: newProject,
                  phase_ids: [],
                });
              }
            });
          });
      }
    }
  },
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
}

export default injectIntl(
  localize(DragSource('IDEA', ideaSource, collect)(IdeaRow))
);
