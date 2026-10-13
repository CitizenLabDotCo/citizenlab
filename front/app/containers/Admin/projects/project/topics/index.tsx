import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IInputTopicData } from 'api/input_topics/types';
import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { ButtonWrapper } from 'components/admin/PageWrapper';
import { TextCell } from 'components/admin/ResourceList';
import SortableList from 'components/admin/ResourceList/SortableList';
import {
  SectionTitle,
  SectionDescription,
  StyledLink,
} from 'components/admin/Section';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { isAdmin } from 'utils/permissions/roles';
import { useParams } from 'utils/router';

import IndentedSortableRow from './IndentedSortableRow';
import LiveAutoInputTopicsControl from './LiveAutoInputTopicsControl';
import messages from './messages';
import useInputTopicsEditor from './useInputTopicsEditor';

const ProjectInputTopics = () => {
  const { projectId } = useParams({
    from: '/$locale/admin/projects/$projectId',
  });

  const nestedInputTopicsActive = useFeatureFlag({
    name: 'nested_input_topics',
  });

  const { data: authUser } = useAuthUser();
  const {
    inputTopics,
    sortableItems,
    isLastRootTopic,
    handleReorder,
    openAdd,
    openAddSubtopic,
    openEdit,
    openDelete,
    modals,
  } = useInputTopicsEditor(projectId);

  if (!authUser || isNilOrError(inputTopics)) return null;

  const canAccessPlatformTopicsSettingsRoute = isAdmin(authUser);

  const handleDeleteClick =
    (topic: IInputTopicData) => (event: React.FormEvent<any>) => {
      event.preventDefault();
      openDelete(topic);
    };

  const handleEditClick =
    (topic: IInputTopicData) => (event: React.FormEvent<any>) => {
      event.preventDefault();
      openEdit(topic);
    };

  const handleAddSubtopicClick =
    (parentId: string) => (event: React.FormEvent<any>) => {
      event.preventDefault();
      openAddSubtopic(parentId);
    };

  return (
    <Box minHeight="80vh" mb="40px">
      <SectionTitle>
        <FormattedMessage {...messages.title} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.projectTopicsDescription} />
        {canAccessPlatformTopicsSettingsRoute && (
          <span>
            &nbsp;
            <FormattedMessage
              {...messages.defaultInputTopicsInfo}
              values={{
                settingsLink: (
                  <StyledLink to="/admin/settings/topics/input">
                    <FormattedMessage
                      {...messages.defaultInputTopicsSettings}
                    />
                  </StyledLink>
                ),
              }}
            />
          </span>
        )}
      </SectionDescription>

      <LiveAutoInputTopicsControl projectId={projectId} />

      <ButtonWrapper>
        <ButtonWithLink
          buttonStyle="admin-dark"
          icon="plus-circle"
          onClick={openAdd}
          id="e2e-add-input-topic-button"
        >
          <FormattedMessage {...messages.addInputTopic} />
        </ButtonWithLink>
      </ButtonWrapper>

      {isLastRootTopic && (
        <Warning>
          <FormattedMessage {...messages.lastTopicWarning} />
        </Warning>
      )}

      <SortableList items={sortableItems} onReorder={handleReorder}>
        {({ itemsList, handleDragRow, handleDropRow }) => (
          <>
            {itemsList.map((item, index) => {
              const topic = item as unknown as IInputTopicData;
              const isRootTopic = topic.attributes.depth === 0;
              // Only prevent deleting if it's the last root topic
              const canDelete = !(isRootTopic && isLastRootTopic);

              return (
                <IndentedSortableRow
                  key={topic.id}
                  id={topic.id}
                  depth={topic.attributes.depth}
                  index={index}
                  isLastItem={index === itemsList.length - 1}
                  moveRow={handleDragRow}
                  dropRow={handleDropRow}
                >
                  <TextCell className="expand">
                    <T value={topic.attributes.title_multiloc} />
                  </TextCell>
                  <Box display="flex" alignItems="center" gap="16px">
                    {nestedInputTopicsActive && isRootTopic && (
                      <ButtonWithLink
                        onClick={handleAddSubtopicClick(topic.id)}
                        buttonStyle="text"
                        icon="plus-circle"
                        m="0px"
                        id="e2e-add-subtopic-button"
                      >
                        <FormattedMessage {...messages.addSubtopic} />
                      </ButtonWithLink>
                    )}
                    <ButtonWithLink
                      onClick={handleEditClick(topic)}
                      buttonStyle="secondary-outlined"
                      icon="edit"
                      m="0px"
                      id="e2e-input-topic-edit-button"
                    >
                      <FormattedMessage {...messages.edit} />
                    </ButtonWithLink>
                    <ButtonWithLink
                      onClick={handleDeleteClick(topic)}
                      buttonStyle="text"
                      icon="delete"
                      disabled={!canDelete}
                      id="e2e-input-topic-delete-button"
                    >
                      <FormattedMessage {...messages.delete} />
                    </ButtonWithLink>
                  </Box>
                </IndentedSortableRow>
              );
            })}
          </>
        )}
      </SortableList>

      {modals}
    </Box>
  );
};

export default ProjectInputTopics;
