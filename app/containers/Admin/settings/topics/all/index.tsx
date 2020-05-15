import React, { lazy } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { InjectedIntlProps } from 'react-intl';
import { isNilOrError } from 'utils/helperUtils';

import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';
import { deleteTopic } from 'services/topics';

import messages from '../messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

// components
import { Section, SectionSubtitle, SectionTitle } from 'components/admin/Section';
import { List } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import DefaultTopicRow from '../DefaultTopicRow';
import CustomTopicRow from '../CustomTopicRow';

interface InputProps { }

interface DataProps {
  topics: GetTopicsChildProps;
}

interface Props extends InputProps, DataProps { }

interface State {
  isProcessing: boolean;
}

class TopicList extends React.PureComponent<Props & InjectedIntlProps, State>{

  constructor(props) {
    super(props);
    this.state = {
      isProcessing: false
    };
  }

  handleDeleteClick = (topicId: string) => (event: React.FormEvent<any>) => {
    if (!this.state.isProcessing) {
      const deleteMessage = this.props.intl.formatMessage(messages.topicDeletionConfirmation);
      event.preventDefault();

      if (window.confirm(deleteMessage)) {
        deleteTopic(topicId);
      }
    }
  }

  render() {
    const { topics } = this.props;

    if (!isNilOrError(topics)) {
      let isLastItem = false;
      const isDefaultTopic = true; // TO BE CHANGED

      return (
        <Section>
          <SectionTitle>
            <FormattedMessage {...messages.titleTopicManager} />
          </SectionTitle>
          <SectionSubtitle>
            <FormattedMessage {...messages.subtitleTopicManager} />
          </SectionSubtitle>

          <ButtonWrapper>
            <Button
              buttonStyle="cl-blue"
              icon="plus-circle"
              linkTo="/admin/settings/topics/new"
            >
              <FormattedMessage {...messages.addTopicButton} />
            </Button>
          </ButtonWrapper>

          <List key={topics.length}>
            {
              topics.map((topic, index) => {
                if (!isNilOrError(topic)) {
                  if (index === topics.length - 1) {
                    isLastItem = true;
                  }
                  return (
                    isDefaultTopic ?
                      <DefaultTopicRow
                        topic={topic}
                        isLastItem={isLastItem}
                      />
                    :
                      <CustomTopicRow
                        topic={topic}
                        isLastItem={isLastItem}
                        handleDeleteClick={this.handleDeleteClick}
                      />
                  );
                }

                return null;
              })
            }
          </List>
        </Section>
      );
    }

    return null;
  }
}

const TopicListWithHoCs = DragDropContext(HTML5Backend)(injectIntl<Props>(TopicList));

export default () => (
  <GetTopics>
    {topics => (<TopicListWithHoCs topics={topics} />)}
  </GetTopics>
);
