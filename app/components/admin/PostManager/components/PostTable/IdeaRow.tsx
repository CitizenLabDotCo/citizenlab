import React from 'react';
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

// style
import AssigneeSelect from './AssigneeSelect';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../../tracks';
import { TFilterMenu, ManagerType } from '../..';
import { TitleLink, StyledRow } from './Row';
import SubRow from './SubRow';

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

type Props = InputProps & {
  connectDragSource: any;
};

class IdeaRow extends React.PureComponent<
  Props & InjectedIntlProps & InjectedLocalized
> {
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
  onUpdateIdeaAssignee = (assigneeId: string | undefined) => {
    const { idea } = this.props;
    const ideaId = idea.id;

    updateIdea(ideaId, { assignee_id: assigneeId || null });

    trackEventByName(tracks.changeIdeaAssignment, {
      location: 'Idea Manager',
      method: 'Changed through the dropdown n the table overview',
      idea: ideaId,
    });
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
      onClickCheckbox,
      onClickTitle,
      nothingHappens,
    } = this.props;

    const selectedStatus: string | undefined = get(
      idea,
      'relationships.idea_status.data.id'
    );
    const selectedPhases = idea.relationships.phases.data.map((p) => p.id);
    const selectedTopics = idea.relationships.topics?.data.map((p) => p.id);
    const attrs = idea.attributes;
    const active = selection.has(idea.id);
    const projectId = get(idea, 'relationships.project.data.id');
    const assigneeId = get(idea, 'relationships.assignee.data.id');

    return (
      <>
        <WrappedRow
          className={`${className} e2e-idea-manager-idea-row`}
          as={StyledRow}
          active={active}
          ref={(instance) => {
            instance && connectDragSource(findDOMNode(instance));
          }}
        >
          <Table.Cell collapsing={true}>
            <Checkbox
              checked={!!active}
              onChange={onClickCheckbox}
              size="21px"
            />
          </Table.Cell>
          <Table.Cell>
            <TitleLink
              className="e2e-idea-manager-idea-title"
              onClick={onClickTitle}
            >
              <T value={attrs.title_multiloc} />
            </TitleLink>
          </Table.Cell>
          <Table.Cell onClick={nothingHappens} singleLine>
            <AssigneeSelect
              onAssigneeChange={this.onUpdateIdeaAssignee}
              projectId={projectId}
              assigneeId={assigneeId}
            />
          </Table.Cell>
          <Table.Cell>
            <FormattedRelative value={attrs.published_at} />
          </Table.Cell>
          <Table.Cell singleLine>
            <Icon name="thumbs up" />
            {attrs.upvotes_count}
          </Table.Cell>
          <Table.Cell singleLine>
            <Icon name="thumbs down" />
            {attrs.downvotes_count}
          </Table.Cell>
          <FeatureFlag name="participatory_budgeting">
            <Table.Cell singleLine>{attrs.baskets_count}</Table.Cell>
          </FeatureFlag>
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
