// Libraries
import React, { memo, useCallback } from 'react';
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
import selectStyles from 'components/UI/MultipleSelect/styles';

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

interface Props {
  selectableTopicIds: string[];
  handleAddSelectedTopic: (topicId: string) => void;
}

const ProjectTopicSelector = memo((props: Props & InjectedIntlProps) => {
  const { selectableTopicIds, intl: { formatMessage } } = props;
  const selectableTopics = useTopics(selectableTopicIds);
  const locale = useLocale();
  const tenantLocales = useTenantLocales();

  const handleTopicSelectionChange = useCallback(() => {

  }, []);

  const getOptions = () => {
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
  };

  return (
    <Container>
      <SelectGroupsContainer>
        <MultipleSelect
          value={selectedTopics}
          options={getOptions()}
          onChange={handleTopicSelectionChange}
        />

        <AddTopicButton
          text={formatMessage(messages.addTopics)}
          buttonStyle="cl-blue"
          icon="plus-circle"
          onClick={this.handleOnAddModeratorsClick}
          disabled={!selection || selection.length === 0}
          processing={this.state.processing}
        />
      </SelectGroupsContainer>
    </Container>
  );

});

export default injectIntl<Props>(ProjectTopicSelector);
