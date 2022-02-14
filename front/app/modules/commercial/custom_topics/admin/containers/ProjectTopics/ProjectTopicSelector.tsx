// Libraries
import React, { memo, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// Hooks
import useTopics from 'hooks/useTopics';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';
import injectLocalize, { InjectedLocalized } from 'utils/localize';

// Components
import Button from 'components/UI/Button';
import MultipleSelect from 'components/UI/MultipleSelect';

// Style
import styled from 'styled-components';

// Typings
import { IOption } from 'typings';
import { ITopicData } from 'services/topics';

// Services
import { addProjectAllowedInputTopic } from 'services/projectAllowedInputTopics';

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

const AddTopicButton = styled(Button)`
  flex-grow: 0;
  flex-shrink: 0;
  margin-left: 30px;
`;

const StyledMultipleSelect = styled(MultipleSelect)`
  width: 350px;
`;

interface Props {}

const ProjectTopicSelector = memo(
  (props: Props & InjectedIntlProps & WithRouterProps & InjectedLocalized) => {
    const {
      intl: { formatMessage },
      localize,
      params: { projectId },
    } = props;
    const topics = useTopics({});
    const projectTopics = useTopics({ projectId });
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
        addProjectAllowedInputTopic(projectId, topicId)
      );

      try {
        await Promise.all(promises);
        setProcessing(false);
        setSelectedTopicOptions([]);
      } catch {
        setProcessing(false);
      }
    };

    const getOptions = () => {
      if (!isNilOrError(topics) && !isNilOrError(projectTopics)) {
        const allTopics = topics.filter(
          (topicId) => !isNilOrError(topicId)
        ) as ITopicData[];
        const selectedInProjectTopics = projectTopics.filter(
          (topic) => !isNilOrError(topic)
        ) as ITopicData[];
        const selectedInProjectTopicIds = selectedInProjectTopics.map(
          (topic) => topic.id
        );
        const selectableTopics = allTopics.filter(
          (topic) => !selectedInProjectTopicIds.includes(topic.id)
        );

        return selectableTopics.map((topic) => {
          return {
            value: topic.id,
            label: localize(topic.attributes.title_multiloc),
          };
        });
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
            buttonStyle="cl-blue"
            icon="plus-circle"
            onClick={handleOnAddTopicsClick}
            disabled={
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

export default injectIntl<Props>(
  withRouter(injectLocalize(ProjectTopicSelector))
);
