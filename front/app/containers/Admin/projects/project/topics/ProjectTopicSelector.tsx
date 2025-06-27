import React, { memo, useState } from 'react';

import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';
import { IOption } from 'typings';

import useAddProjectAllowedInputTopic from 'api/project_allowed_input_topics/useAddProjectAllowedInputTopic';
import useProjectAllowedInputTopics from 'api/project_allowed_input_topics/useProjectAllowedInputTopics';
import { getTopicIds } from 'api/project_allowed_input_topics/util/getProjectTopicsIds';
import useTopics from 'api/topics/useTopics';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import MultipleSelect from 'components/UI/MultipleSelect';

import { trackEventByName } from 'utils/analytics';
import { injectIntl } from 'utils/cl-intl';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import injectLocalize, { InjectedLocalized } from 'utils/localize';

import messages from './messages';
import tracks from './tracks';

const Container = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

const SelectGroupsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  align-items: center;
  margin-bottom: 30px;
`;

const AddTopicButton = styled(ButtonWithLink)`
  flex-grow: 0;
  flex-shrink: 0;
  margin-left: 30px;
`;

const StyledMultipleSelect = styled(MultipleSelect)`
  width: 350px;
`;

interface Props {}

const ProjectTopicSelector = memo(
  (
    props: Props & WrappedComponentProps & WithRouterProps & InjectedLocalized
  ) => {
    const {
      intl: { formatMessage },
      localize,
      params: { projectId },
    } = props;
    const { data: topics } = useTopics();
    const { data: projectAllowedInputTopics } = useProjectAllowedInputTopics({
      projectId,
    });
    const { mutateAsync: addProjectAllowedInputTopic } =
      useAddProjectAllowedInputTopic();

    const [selectedTopicOptions, setSelectedTopicOptions] = useState<IOption[]>(
      []
    );
    const [processing, setProcessing] = useState(false);

    const handleTopicSelectionChange = (newSelectedTopicOptions: IOption[]) => {
      setSelectedTopicOptions(newSelectedTopicOptions);
    };

    const handleOnAddTopicsClick = async (_event: React.FormEvent) => {
      const topicIdsToAdd = selectedTopicOptions.map(
        (topicOption) => topicOption.value
      ) as string[];

      setProcessing(true);

      const promises = topicIdsToAdd.map((topicId) =>
        addProjectAllowedInputTopic({
          project_id: projectId,
          topic_id: topicId,
        })
      );

      try {
        await Promise.all(promises);
        trackEventByName(tracks.projectTagsEdited, { projectId });
        setProcessing(false);
        setSelectedTopicOptions([]);
      } catch {
        setProcessing(false);
      }
    };

    const getOptions = () => {
      if (topics && projectAllowedInputTopics) {
        const selectedInProjectTopicIds = getTopicIds(
          projectAllowedInputTopics.data
        );
        const selectedInProjectTopicIdsSet = new Set(selectedInProjectTopicIds);

        const selectableTopics = topics.data.filter(
          (topic) => !selectedInProjectTopicIdsSet.has(topic.id)
        );

        return selectableTopics.map((topic) => ({
          value: topic.id,
          label: localize(topic.attributes.title_multiloc),
        }));
      }

      return [];
    };

    return (
      <Container>
        <SelectGroupsContainer>
          <StyledMultipleSelect
            value={selectedTopicOptions}
            options={getOptions()}
            onChange={handleTopicSelectionChange}
            id="e2e-project-topic-multiselect"
          />

          <AddTopicButton
            text={formatMessage(messages.addTopics)}
            buttonStyle="admin-dark"
            icon="plus-circle"
            onClick={handleOnAddTopicsClick}
            disabled={
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              !selectedTopicOptions || selectedTopicOptions.length === 0
            }
            processing={processing}
            id="e2e-add-project-topic-button"
          />
        </SelectGroupsContainer>
      </Container>
    );
  }
);

export default injectIntl(withRouter(injectLocalize(ProjectTopicSelector)));
