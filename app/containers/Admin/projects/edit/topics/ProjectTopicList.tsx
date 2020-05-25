import React, { memo, FormEvent } from 'react';
import { isError } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';

// components
import Button from 'components/UI/Button';
import { SortableList, SortableRow } from 'components/admin/ResourceList';

// hooks
import useTopics from 'hooks/useTopics';
import { ITopicData } from 'services/topics';

interface Props {
  selectedTopicIds: string[];
  handleRemoveSelectedTopic: (topicId: string) => void;
}

const ProjectTopicList = memo(({
  selectedTopicIds,
  localize
}: Props & InjectedIntlProps & InjectedLocalized) => {

  const handleRemoveSelectedTopic = (topicId: string) => (event: FormEvent) => {
    event.preventDefault();

    this.props.handleRemoveSelectedTopic(topicId);
  };

  const handleReorderTopicProject = () => {
    // To implement
  };

  const topics = useTopics(selectedTopicIds);

  if (!isNilOrError(topics)) {
    const selectedTopics = topics.filter(topic => !isNilOrError(topic)) as ITopicData[];

    return (
      <>
        <SortableList
          items={selectedTopics}
          onReorder={handleReorderTopicProject}
          className="projects-list e2e-admin-projects-list"
          id="e2e-admin-published-projects-list"
        >
          {({ itemsList, handleDragRow, handleDropRow }) => (
            itemsList.map((topic: ITopicData, index: number) => {
              return (
                <SortableRow
                  id={topic.id}
                  key={index}
                  moveRow={handleDragRow}
                  dropRow={handleDropRow}
                  lastItem={(index === selectedTopics.length - 1)}
                >
                  <p>{localize(topic.attributes.title_multiloc)}</p>
                  <Button
                    onClick={handleRemoveSelectedTopic(topic.id)}
                    buttonStyle="text"
                    icon="delete"
                  >
                    <FormattedMessage {...messages.remove} />
                  </Button>
                </SortableRow>
              );
            }))
          }
        </SortableList>
        {/* {isError(moderators) &&
          <FormattedMessage {...messages.moderatorsNotFound} />
        } */}
      </>
    );
  }

  return null;
});

const ProjectTopicListWithHOCs = injectIntl<Props>(injectLocalize(ProjectTopicList));

export default ProjectTopicListWithHOCs;
