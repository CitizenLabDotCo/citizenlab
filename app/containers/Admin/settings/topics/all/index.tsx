import React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { InjectedIntlProps } from 'react-intl';
import { isNilOrError } from 'utils/helperUtils';
import { isEqual } from 'lodash-es';

import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';
import { deleteTopic, ITopicData } from 'services/topics';

import messages from '../messages';
import T from 'components/T';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

import { Section, SectionSubtitle, SectionTitle } from 'components/admin/Section';
import { List, TextCell, Row } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import styled from 'styled-components';

const Buttons = styled.div`
  display: flex;
  align-items: center;
`;

interface InputProps { }

interface DataProps {
  topics: GetTopicsChildProps;
}

interface Props extends InputProps, DataProps { }

interface State {
  itemsWhileDragging: (ITopicData | Error)[] | null;
  isProcessing: boolean;
}

class TopicList extends React.PureComponent<Props & InjectedIntlProps, State>{

  constructor(props) {
    super(props);
    this.state = {
      itemsWhileDragging: null,
      isProcessing: false
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { itemsWhileDragging } = this.state;
    const prevTopicsIds = (!isNilOrError(prevProps.topics) && prevProps.topics.map(topic => !isNilOrError(topic) && topic.id));
    const nextTopicsIds = (!isNilOrError(this.props.topics) && this.props.topics.map(topic => !isNilOrError(topic) && topic.id));

    if (itemsWhileDragging && !isEqual(prevTopicsIds, nextTopicsIds)) {
      this.setState({ itemsWhileDragging: null });
    }
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

  listItems = () => {
    const { itemsWhileDragging } = this.state;
    const { topics } = this.props;
    return (itemsWhileDragging || topics);
  }

  render() {
    const listItems = this.listItems() || [];
    if (isNilOrError(listItems)) return null;
    const listItemsLength = listItems.length;
    let lastItem = false;
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
        <List key={listItems.length}>
          {
            listItems.map((field, index) => {
              if (index === listItemsLength - 1) {
                lastItem = true;
              }
              if (isNilOrError(field)) return null;
              return (
                <Row
                  key={field.id}
                  id={field.id}
                  className="e2e-topic-field-row"
                  lastItem={lastItem}
                >
                  <TextCell className="expand">
                    <T value={field.attributes.title_multiloc} />
                  </TextCell>
                  <Buttons>
                    <Button
                      onClick={this.handleDeleteClick(field.id)}
                      buttonStyle="text"
                      icon="delete"
                    >
                      <FormattedMessage {...messages.deleteButtonLabel} />
                    </Button>

                    <Button
                      linkTo={`/admin/settings/topics/${field.id}`}
                      buttonStyle="secondary"
                      icon="edit"
                    >
                      <FormattedMessage {...messages.editButtonLabel} />
                    </Button>
                  </Buttons>
                </Row>
              );
            })
          }
        </List>
      </Section>
    );
  }
}

const TopicListWithHoCs = DragDropContext(HTML5Backend)(injectIntl<Props>(TopicList));

export default () => (
  <GetTopics>
    {topics => (<TopicListWithHoCs topics={topics} />)}
  </GetTopics>
);
