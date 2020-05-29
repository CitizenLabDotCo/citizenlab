// Libraries
import React, { memo, useCallback, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// Hooks
import useTopics from 'hooks/useTopics';
import useProjectTopics from 'hooks/useProjectTopics';

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

interface Props {
  handleAddSelectedTopics: (topics: ITopicData[]) => void;
  processing: boolean;
}

const ProjectTopicSelector = memo((props: Props & InjectedIntlProps & WithRouterProps & InjectedLocalized) => {
  const {
    handleAddSelectedTopics,
    intl: { formatMessage },
    processing,
    localize,
    params: { projectId }
  } = props;
  const topics = useTopics();
  const projectTopics = useProjectTopics({ projectId });
  const [selectedTopicOptions, setSelectedTopicOptions] = useState<IOption[]>([]);

  // value of useCallback here?
  const handleTopicSelectionChange = useCallback((newSelectedTopicOptions: IOption[]) => {
    setSelectedTopicOptions(newSelectedTopicOptions);
  }, []);

  const handleOnAddTopicsClick = useCallback(
    (selectableTopics: ITopicData[], selectedTopicOptions: IOption[]) =>
    (_event: React.FormEvent) => {
    const newlySelectedTopicIds = selectedTopicOptions.map(topicOption => topicOption.value) as string[];
    const newlySelectedTopics = selectableTopics.filter(topic => newlySelectedTopicIds.includes(topic.id));
    handleAddSelectedTopics(newlySelectedTopics);
  }, []);

  const getOptions = (selectableTopics: ITopicData[]) => {
    return selectableTopics.map(topic => {
      return ({
        value: topic.id,
        label: localize(
          topic.attributes.title_multiloc
        )
      });
    });
  };

  if (
    !isNilOrError(topics) &&
    !isNilOrError(projectTopics)
  ) {
    const allTopics = topics.filter(topicId => !isNilOrError(topicId)) as ITopicData[];
    const projectTopicIds = projectTopics.map(topic => topic.id);
    const selectableTopics = allTopics.filter(topic => !projectTopicIds.includes(topic.id));

    return (
      <Container>
        <SelectGroupsContainer>
          <StyledMultipleSelect
            value={selectedTopicOptions}
            options={getOptions(selectableTopics)}
            onChange={handleTopicSelectionChange}
          />

          <AddTopicButton
            text={formatMessage(messages.addTopics)}
            buttonStyle="cl-blue"
            icon="plus-circle"
            onClick={handleOnAddTopicsClick(selectableTopics, selectedTopicOptions)}
            disabled={!selectedTopicOptions || selectedTopicOptions.length === 0}
            processing={processing}
          />
        </SelectGroupsContainer>
      </Container>
    );
  }

  return null;
});

export default injectIntl<Props>(withRouter(injectLocalize(ProjectTopicSelector)));
