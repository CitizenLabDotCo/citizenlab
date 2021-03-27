import React from 'react';
import { DragDropContext } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';
import { InjectedIntlProps } from 'react-intl';
import { isNilOrError } from 'utils/helperUtils';

import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';
import { deleteTopic } from 'services/topics';

import messages from '../messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

// components
import {
  Section,
  SectionDescription,
  SectionTitle,
  StyledLink,
} from 'components/admin/Section';
import { List } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import DefaultTopicRow from '../DefaultTopicRow';
import CustomTopicRow from '../CustomTopicRow';
import Modal, {
  ModalContentContainer,
  ButtonsWrapper,
  Content,
} from 'components/UI/Modal';

interface InputProps {}

interface DataProps {
  topics: GetTopicsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  showConfirmationModal: boolean;
  topicIdToDelete: string | null;
  processingDeletion: boolean;
}

class TopicList extends React.PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      processingDeletion: false,
      showConfirmationModal: false,
      topicIdToDelete: null,
    };
  }

  handleDeleteClick = (topicId: string) => (event: React.FormEvent<any>) => {
    event.preventDefault();

    this.setState({
      showConfirmationModal: true,
      topicIdToDelete: topicId,
    });
  };

  closeSendConfirmationModal = () => {
    this.setState({
      showConfirmationModal: false,
      topicIdToDelete: null,
    });
  };

  handleTopicDeletionConfirm = () => {
    const { topicIdToDelete } = this.state;

    if (topicIdToDelete) {
      this.setState({
        processingDeletion: true,
      });

      deleteTopic(topicIdToDelete)
        .then(() => {
          this.setState({
            processingDeletion: false,
            showConfirmationModal: false,
            topicIdToDelete: null,
          });
        })
        .catch(() => {
          this.setState({
            processingDeletion: false,
          });
        });
    }
  };

  render() {
    const { topics } = this.props;
    const { showConfirmationModal, processingDeletion } = this.state;

    if (!isNilOrError(topics)) {
      return (
        <Section>
          <SectionTitle>
            <FormattedMessage {...messages.titleTopicManager} />
          </SectionTitle>
          <SectionDescription>
            <FormattedMessage
              {...messages.descriptionTopicManagerText}
              values={{
                adminProjectsLink: (
                  <StyledLink to="/admin/projects/">
                    <FormattedMessage {...messages.projectsSettings} />
                  </StyledLink>
                ),
              }}
            />
          </SectionDescription>

          <ButtonWrapper>
            <Button
              buttonStyle="cl-blue"
              icon="plus-circle"
              linkTo="/admin/settings/topics/new"
              id="e2e-add-custom-topic-button"
            >
              <FormattedMessage {...messages.addTopicButton} />
            </Button>
          </ButtonWrapper>
          <List key={topics.length}>
            {topics.map((topic, index) => {
              const isLastItem = index === topics.length - 1;

              if (!isNilOrError(topic)) {
                const isDefaultTopic = topic.attributes.code !== 'custom';

                return isDefaultTopic ? (
                  <DefaultTopicRow
                    topic={topic}
                    isLastItem={isLastItem}
                    key={topic.id}
                  />
                ) : (
                  <CustomTopicRow
                    topic={topic}
                    isLastItem={isLastItem}
                    handleDeleteClick={this.handleDeleteClick}
                    key={topic.id}
                  />
                );
              }

              return null;
            })}
          </List>
          <Modal
            opened={showConfirmationModal}
            close={this.closeSendConfirmationModal}
            header={<FormattedMessage {...messages.confirmHeader} />}
          >
            <ModalContentContainer>
              <Content>
                <FormattedMessage {...messages.deleteTopicConfirmation} />
              </Content>
              <ButtonsWrapper>
                <Button
                  buttonStyle="secondary"
                  onClick={this.closeSendConfirmationModal}
                >
                  <FormattedMessage {...messages.cancel} />
                </Button>
                <Button
                  buttonStyle="delete"
                  onClick={this.handleTopicDeletionConfirm}
                  processing={processingDeletion}
                  id="e2e-custom-topic-delete-confirmation-button"
                >
                  <FormattedMessage {...messages.delete} />
                </Button>
              </ButtonsWrapper>
            </ModalContentContainer>
          </Modal>
        </Section>
      );
    }

    return null;
  }
}

const TopicListWithHoCs = DragDropContext(HTML5Backend)(
  injectIntl<Props>(TopicList)
);

export default () => (
  <GetTopics>{(topics) => <TopicListWithHoCs topics={topics} />}</GetTopics>
);
