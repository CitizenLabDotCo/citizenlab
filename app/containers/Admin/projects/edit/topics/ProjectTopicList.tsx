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

  const selectedTopics = useTopics(selectedTopicIds);

  return (
    <SortableList
      items={AdminPublicationsList}
      onReorder={handleReorderAdminPublication}
      className="projects-list e2e-admin-projects-list"
      id="e2e-admin-published-projects-list"
    >
      {!isNilOrError(selectedTopics) && selectedTopics.map((topic, index) => {
        if (!isNilOrError(topic)) {
          return (
            <SortableRow
              id={topic.id}
              key={index}
              isLastItem={(index === selectedTopics.length - 1)}
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
        }

        return null;
      })
    }
      {/* {isError(moderators) &&
        <FormattedMessage {...messages.moderatorsNotFound} />
      } */}
    </SortableList>
  );
});

const ProjectTopicListWithHOCs = injectIntl<Props>(injectLocalize(ProjectTopicList));

export default ProjectTopicListWithHOCs;
