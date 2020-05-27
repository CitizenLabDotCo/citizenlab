// Libraries
import React, { memo, useCallback, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// Hooks
import useTopics from 'hooks/useTopics';
import useTenantLocales from 'hooks/useTenantLocales';
import useLocale from 'hooks/useLocale';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';
import { getLocalized } from 'utils/i18n';

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
  selectableTopicIds: string[];
  handleAddSelectedTopics: (topicIds: string[]) => void;
  processing: boolean;
}

const ProjectTopicSelector = memo((props: Props & InjectedIntlProps) => {
  const {
    selectableTopicIds,
    handleAddSelectedTopics,
    intl: { formatMessage },
    processing
  } = props;
  const selectableTopics = useTopics(selectableTopicIds);
  const locale = useLocale();
  const tenantLocales = useTenantLocales();
  const [selectedTopicOptions, setSelectedTopicOptions] = useState<IOption[]>([]);

  // value of useCallback here?
  const handleTopicSelectionChange = useCallback((newSelectedTopicOptions: IOption[]) => {
    setSelectedTopicOptions(newSelectedTopicOptions);
  }, []);

  const handleOnAddTopicsClick = useCallback(() => {
    const newlySelectedTopicIds = selectedTopicOptions.map(topicOption => topicOption.value) as string[];
    handleAddSelectedTopics(newlySelectedTopicIds);
  }, []);

  const getOptions = useCallback(() => {
    if (!isNilOrError(selectableTopics)) {
      const topics = selectableTopics.filter(topicId => !isNilOrError(topicId)) as ITopicData[];
      return topics.map(topic => {
        return ({
          value: topic.id,
          label: getLocalized(
            topic.attributes.title_multiloc,
            locale,
            tenantLocales
          )
        });
      });
    }

    return null;
  }, [selectableTopics]);

  return (
    <Container>
      <SelectGroupsContainer>
        <StyledMultipleSelect
          value={selectedTopicOptions}
          options={getOptions()}
          onChange={handleTopicSelectionChange}
        />

        <AddTopicButton
          text={formatMessage(messages.addTopics)}
          buttonStyle="cl-blue"
          icon="plus-circle"
          onClick={handleOnAddTopicsClick}
          disabled={!selectedTopicOptions || selectedTopicOptions.length === 0}
          processing={processing}
        />
      </SelectGroupsContainer>
    </Container>
  );

});

export default injectIntl<Props>(ProjectTopicSelector);
