import React from 'react';
import { InjectedIntlProps } from 'react-intl';
import { isNilOrError } from 'utils/helperUtils';

import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';
import { deleteTopic } from 'services/topics';

import messages from '../messages';
import T from 'components/T';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

import { Section, SectionSubtitle, SectionTitle } from 'components/admin/Section';
import { List, Row, TextCell } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import { ButtonWrapper } from 'components/admin/PageWrapper';

interface InputProps { }

interface DataProps {
  topics: GetTopicsChildProps;
}

interface Props extends InputProps, DataProps { }

interface State {
  terminologyOpened: boolean;
}

class TopicList extends React.PureComponent<Props & InjectedIntlProps, State>{

  constructor(props) {
    super(props);
  }

  handleDeleteClick = (topicId: string) => (event: React.FormEvent<any>) => {
    const deleteMessage = this.props.intl.formatMessage(messages.topicDeletionConfirmation);
    event.preventDefault();

    if (window.confirm(deleteMessage)) {
      deleteTopic(topicId);
    }
  }

  render() {
    const { topics } = this.props;

    if (isNilOrError(topics)) return null;

    return (
      <Section>
        <SectionTitle>
          <FormattedMessage {...messages.titleTopics} />
        </SectionTitle>
        <SectionSubtitle>
          <FormattedMessage {...messages.subtitleTopics} />
        </SectionSubtitle>

        <ButtonWrapper>
          <Button
            style="cl-blue"
            icon="plus-circle"
            linkTo="/admin/topics/new"
          >
            <FormattedMessage {...messages.addTopicButton} />
          </Button>
        </ButtonWrapper>
        <List>
          {topics.map((topic, index) => (
            !isNilOrError(topic) && (
              <Row key={topic.id} lastItem={(index === topics.length - 1)}>
                <TextCell className="expand">
                  <T value={topic.attributes.title_multiloc} />
                </TextCell>
                <Button
                  onClick={this.handleDeleteClick(topic.id)}
                  style="text"
                  icon="delete"
                >
                  <FormattedMessage {...messages.deleteButtonLabel} />
                </Button>
                <Button
                  linkTo={`/admin/topics/${topic.id}`}
                  style="secondary"
                  icon="edit"
                >
                  <FormattedMessage {...messages.editButtonLabel} />
                </Button>
            </Row>
            )
          ))}
        </List>
      </Section>
    );
  }
}

const TopicListWithHoCs = injectIntl<Props>(TopicList);

export default () => (
  <GetTopics>
    {topics => (<TopicListWithHoCs topics={topics} />)}
  </GetTopics>
);
