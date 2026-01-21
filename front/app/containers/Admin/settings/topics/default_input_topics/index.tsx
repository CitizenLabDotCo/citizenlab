import React, { useState, useMemo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IDefaultInputTopicData } from 'api/default_input_topics/types';
import useDefaultInputTopics from 'api/default_input_topics/useDefaultInputTopics';
import useDeleteDefaultInputTopic from 'api/default_input_topics/useDeleteDefaultInputTopic';

import { ButtonWrapper } from 'components/admin/PageWrapper';
import { TextCell, Row } from 'components/admin/ResourceList';
import { Section, SectionDescription } from 'components/admin/Section';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal, {
  ModalContentContainer,
  ButtonsWrapper,
  Content,
} from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

// Flatten the tree structure for display, preserving parent-child order
const flattenTopics = (
  topics: IDefaultInputTopicData[],
  included: IDefaultInputTopicData[] | undefined
): IDefaultInputTopicData[] => {
  const includedMap = new Map<string, IDefaultInputTopicData>();
  included?.forEach((topic) => includedMap.set(topic.id, topic));

  const result: IDefaultInputTopicData[] = [];

  topics.forEach((topic) => {
    result.push(topic);
    // Add children from included array
    const childIds = topic.relationships?.children?.data || [];
    childIds.forEach((childRef) => {
      const child = includedMap.get(childRef.id);
      if (child) {
        result.push(child);
      }
    });
  });

  return result;
};

const DefaultInputTopics = () => {
  const { data: defaultInputTopics } = useDefaultInputTopics();
  const { mutate: deleteDefaultInputTopic, isLoading: isDeleting } =
    useDeleteDefaultInputTopic();
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [topicToDelete, setTopicToDelete] =
    useState<IDefaultInputTopicData | null>(null);

  const flattenedTopics = useMemo(() => {
    if (isNilOrError(defaultInputTopics)) return [];
    return flattenTopics(defaultInputTopics.data, defaultInputTopics.included);
  }, [defaultInputTopics]);

  if (isNilOrError(defaultInputTopics)) return null;

  const handleDeleteClick =
    (topic: IDefaultInputTopicData) => (event: React.FormEvent<any>) => {
      event.preventDefault();
      setShowConfirmationModal(true);
      setTopicToDelete(topic);
    };

  const closeSendConfirmationModal = () => {
    setShowConfirmationModal(false);
    setTopicToDelete(null);
  };

  const handleTopicDeletionConfirm = () => {
    if (topicToDelete) {
      deleteDefaultInputTopic(topicToDelete.id, {
        onSuccess: () => {
          setShowConfirmationModal(false);
          setTopicToDelete(null);
        },
      });
    }
  };

  const hasChildren = topicToDelete?.attributes.children_count
    ? topicToDelete.attributes.children_count > 0
    : false;

  return (
    <Section>
      <SectionDescription>
        <FormattedMessage
          {...messages.descriptionDefaultInputTopicManagerText}
        />
      </SectionDescription>

      <ButtonWrapper>
        <ButtonWithLink
          buttonStyle="admin-dark"
          icon="plus-circle"
          linkTo="/admin/settings/topics/input/new"
          id="e2e-add-default-input-topic-button"
        >
          <FormattedMessage {...messages.addDefaultInputTopicButton} />
        </ButtonWithLink>
      </ButtonWrapper>

      <Box>
        {flattenedTopics.map((topic: IDefaultInputTopicData, index: number) => {
          const isSubtopic = topic.attributes.depth > 0;
          const isRootTopic = topic.attributes.depth === 0;

          return (
            <Row
              key={topic.id}
              isLastItem={index === flattenedTopics.length - 1}
            >
              <TextCell className="expand">
                <Box ml={isSubtopic ? '32px' : '0px'}>
                  <T value={topic.attributes.title_multiloc} />
                </Box>
              </TextCell>
              <Box display="flex" alignItems="center" gap="16px">
                {isRootTopic && (
                  <ButtonWithLink
                    linkTo={`/admin/settings/topics/input/new?parent_id=${topic.id}`}
                    buttonStyle="secondary-outlined"
                    icon="plus-circle"
                    m="0px"
                    id="e2e-add-subtopic-button"
                  >
                    <FormattedMessage {...messages.addSubtopicButton} />
                  </ButtonWithLink>
                )}
                <ButtonWithLink
                  linkTo={`/admin/settings/topics/input/${topic.id}/edit`}
                  buttonStyle="secondary-outlined"
                  icon="edit"
                  m="0px"
                  id="e2e-default-input-topic-edit-button"
                >
                  <FormattedMessage {...messages.editButtonLabel} />
                </ButtonWithLink>
                <ButtonWithLink
                  onClick={handleDeleteClick(topic)}
                  buttonStyle="text"
                  icon="delete"
                  id="e2e-default-input-topic-delete-button"
                >
                  <FormattedMessage {...messages.deleteButtonLabel} />
                </ButtonWithLink>
              </Box>
            </Row>
          );
        })}
      </Box>

      <Modal
        opened={showConfirmationModal}
        close={closeSendConfirmationModal}
        header={<FormattedMessage {...messages.confirmHeader} />}
      >
        <ModalContentContainer>
          <Content>
            <FormattedMessage
              {...(hasChildren
                ? messages.deleteDefaultInputTopicWithChildrenConfirmation
                : messages.deleteDefaultInputTopicConfirmation)}
            />
          </Content>
          <ButtonsWrapper>
            <ButtonWithLink
              buttonStyle="secondary-outlined"
              onClick={closeSendConfirmationModal}
            >
              <FormattedMessage {...messages.cancel} />
            </ButtonWithLink>
            <ButtonWithLink
              buttonStyle="delete"
              onClick={handleTopicDeletionConfirm}
              processing={isDeleting}
              id="e2e-default-input-topic-delete-confirmation-button"
            >
              <FormattedMessage {...messages.deleteButtonLabel} />
            </ButtonWithLink>
          </ButtonsWrapper>
        </ModalContentContainer>
      </Modal>
    </Section>
  );
};

export default DefaultInputTopics;
