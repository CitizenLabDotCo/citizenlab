import React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { InjectedIntlProps } from 'react-intl';
import { isNilOrError } from 'utils/helperUtils';
import { clone, isEqual } from 'lodash-es';

import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';
import { deleteTopic, ITopicData, reorderTopic } from 'services/topics';

import messages from '../messages';
import T from 'components/T';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

import { Section, SectionSubtitle, SectionTitle } from 'components/admin/Section';
import { List, TextCell, SortableRow } from 'components/admin/ResourceList';
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

  handleDragRow = (fromIndex, toIndex) => {
    if (!this.state.isProcessing) {
      const listItems = this.listItems();

      if (isNilOrError(listItems)) return;

      const itemsWhileDragging = clone(listItems);
      itemsWhileDragging.splice(fromIndex, 1);
      itemsWhileDragging.splice(toIndex, 0, listItems[fromIndex]);
      // const cleanItemsWhileDragging = itemsWhileDragging.filter(i => !isNilOrError(i)) as ITopicData[];
      this.setState({
        itemsWhileDragging // cleanItemsWhileDragging
      });
    }
  }

  handleDropRow = (fieldId: string, toIndex: number) => {
    const listItems = this.listItems();

    if (isNilOrError(listItems)) return;

    const field = listItems.find(listItem => !isNilOrError(listItem) && listItem.id === fieldId);

    if (!isNilOrError(field) && field.attributes.ordering !== toIndex) {
      this.setState({ isProcessing: true });
      reorderTopic(fieldId, toIndex).then(() => this.setState({ isProcessing: false }));
    } else {
      this.setState({ itemsWhileDragging: null });
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
                <SortableRow
                  key={field.id}
                  id={field.id}
                  className="e2e-topic-field-row"
                  index={index}
                  lastItem={lastItem}
                  moveRow={this.handleDragRow}
                  dropRow={this.handleDropRow}
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
                </SortableRow>
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
