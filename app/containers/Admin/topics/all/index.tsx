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
  itemsWhileDragging: ITopicData[] | null;
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
    const prevCustomFieldsIds = (prevProps.topics && prevProps.topics.map(customField => customField.id));
    const nextCustomFieldsIds = (this.props.topics && this.props.topics.map(customField => customField.id));

    if (itemsWhileDragging && !isEqual(prevCustomFieldsIds, nextCustomFieldsIds)) {
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
      this.setState({ itemsWhileDragging });
    }
  }

  handleDropRow = (fieldId: string, toIndex: number) => {
    const listItems = this.listItems();

    if (isNilOrError(listItems)) return;

    const field = listItems.find(listItem => listItem.id === fieldId);

    if (field && field.attributes.ordering !== toIndex) {
      this.setState({ isProcessing: true });
      reorderTopic(fieldId, { ordering: toIndex }).then(() => this.setState({ isProcessing: false }));
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
        <List key={listItems.length}>
          {
            listItems.map((field, index) => {
              if (index === listItemsLength - 1) {
                lastItem = true;
              }
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
                      style="text"
                      icon="delete"
                    >
                      <FormattedMessage {...messages.deleteButtonLabel} />
                    </Button>

                    <Button
                      linkTo={`/admin/topics/${field.id}`}
                      style="secondary"
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

  // render() {
  //   const { topics } = this.props;

  //   if (isNilOrError(topics)) return null;

  //   return (
  //     <Section>
  //       <SectionTitle>
  //         <FormattedMessage {...messages.titleTopics} />
  //       </SectionTitle>
  //       <SectionSubtitle>
  //         <FormattedMessage {...messages.subtitleTopics} />
  //       </SectionSubtitle>

  //       <ButtonWrapper>
  //         <Button
  //           style="cl-blue"
  //           icon="plus-circle"
  //           linkTo="/admin/topics/new"
  //         >
  //           <FormattedMessage {...messages.addTopicButton} />
  //         </Button>
  //       </ButtonWrapper>
  //       <List>
  //         {topics.map((topic, index) => (
  //           !isNilOrError(topic) && (
  //             <Row key={topic.id} lastItem={(index === topics.length - 1)}>
  //               <TextCell className="expand">
  //                 <T value={topic.attributes.title_multiloc} />
  //               </TextCell>
  //               <Button
  //                 onClick={this.handleDeleteClick(topic.id)}
  //                 style="text"
  //                 icon="delete"
  //               >
  //                 <FormattedMessage {...messages.deleteButtonLabel} />
  //               </Button>
  //               <Button
  //                 linkTo={`/admin/topics/${topic.id}`}
  //                 style="secondary"
  //                 icon="edit"
  //               >
  //                 <FormattedMessage {...messages.editButtonLabel} />
  //               </Button>
  //           </Row>
  //           )
  //         ))}
  //       </List>
  //     </Section>
  //   );
  // }
}

const TopicListWithHoCs = DragDropContext(HTML5Backend)(injectIntl<Props>(TopicList));

export default () => (
  <GetTopics>
    {topics => (<TopicListWithHoCs topics={topics} />)}
  </GetTopics>
);
