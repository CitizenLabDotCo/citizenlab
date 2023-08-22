import React, { useState } from 'react';
import styled from 'styled-components';
import { omit } from 'lodash-es';

import { useParams } from 'react-router-dom';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';
import useDeleteAnalysisTag from 'api/analysis_tags/useDeleteAnalysisTag';
import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';

import {
  Box,
  Button,
  IconButton,
  colors,
  stylingConsts,
  Text,
  Icon,
  ListItem,
} from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import RenameTagModal from './RenameTagModal';
import Tag from './Tag';
import AutotaggingModal from './AutoTaggingModal';
import TagCount from './TagCount';

import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

import { useQueryClient } from '@tanstack/react-query';
import inputsKeys from 'api/analysis_inputs/keys';
import AddTag from './AddTag';

const BlickingIcon = styled(Icon)`
  animation-name: blink-animation;
  animation-duration: 1.8s;
  animation-delay: 1s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;

  @keyframes blink-animation {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

const TagContainer = styled(ListItem)`
  padding: 8px 4px;
  border-radius: ${stylingConsts.borderRadius};
  &:hover {
    background-color: ${colors.background};
  }
  &.selected {
    background-color: ${colors.background};
  }
  cursor: pointer;
`;

const Tags = () => {
  const [renameTagModalOpenedId, setRenameTagModalOpenedId] = useState('');
  const [autotaggingModalIsOpened, setAutotaggingModalIsOpened] =
    useState(false);

  const filters = useAnalysisFilterParams();

  const { formatMessage } = useIntl();

  const { analysisId } = useParams() as { analysisId: string };

  const queryClient = useQueryClient();
  const { data: tags, isLoading } = useAnalysisTags({
    analysisId,
    filters: omit(filters, 'tag_ids'),
  });
  const { mutate: deleteTag } = useDeleteAnalysisTag();

  const inputsTotal = tags?.meta.inputs_total || 1;
  const filteredInputsTotal = tags?.meta.filtered_inputs_total || 1;
  const inputsWithoutTags = tags?.meta.inputs_without_tags || 1;
  const filteredInputsWithoutTags =
    tags?.meta.filtered_inputs_without_tags || 1;

  const handleTagDelete = (id: string) => {
    if (window.confirm(formatMessage(messages.deleteTagConfirmation))) {
      deleteTag({
        analysisId,
        id,
      });
    }
  };

  const closeTagRenameModal = () => {
    setRenameTagModalOpenedId('');
  };

  const selectTag = (id: string) => {
    updateSearchParams({ tag_ids: [id] });
  };

  const selectedTags = filters.tag_ids;

  const handleTagClick = (id: string) => {
    selectTag(id);
    queryClient.invalidateQueries(inputsKeys.lists());
  };

  return (
    <Box>
      <Box>
        <Button
          onClick={() => setAutotaggingModalIsOpened(true)}
          icon="flash"
          mb="12px"
          size="s"
          buttonStyle="secondary-outlined"
        >
          Auto-tag
          {!tags?.data.length && (
            <BlickingIcon
              name={'dot'}
              width="16px"
              height="16px"
              fill={colors.primary}
              ml="8px"
            />
          )}
        </Button>
        <AddTag />
      </Box>
      <Box>
        <TagContainer
          tabIndex={0}
          onClick={() => removeSearchParams(['tag_ids'])}
          className={!selectedTags ? 'selected' : ''}
        >
          All inputs
          <TagCount
            count={inputsTotal}
            totalCount={inputsTotal}
            filteredCount={filteredInputsTotal}
          />
        </TagContainer>
        <TagContainer
          tabIndex={0}
          onClick={() => updateSearchParams({ tag_ids: [null] })}
          className={selectedTags?.length === 0 ? 'selected' : ''}
        >
          Inputs without tags
          <TagCount
            count={inputsWithoutTags}
            totalCount={inputsTotal}
            filteredCount={filteredInputsWithoutTags}
          />
        </TagContainer>
        {!isLoading && tags?.data.length === 0 && (
          <Text p="6px" color="grey400">
            You do not have any tags yet.
          </Text>
        )}
        {tags?.data.map((tag) => (
          <TagContainer
            key={tag.id}
            tabIndex={0}
            onClick={() => handleTagClick(tag.id)}
            className={selectedTags?.includes(tag.id) ? 'selected' : ''}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Tag
                name={tag.attributes.name}
                tagType={tag.attributes.tag_type}
              />
              <Box display="flex">
                <IconButton
                  iconName="edit"
                  onClick={() => setRenameTagModalOpenedId(tag.id)}
                  iconColor={colors.grey700}
                  iconColorOnHover={colors.grey700}
                  a11y_buttonActionMessage={formatMessage(messages.editTag)}
                  iconWidth="20px"
                  iconHeight="20px"
                />
                <IconButton
                  iconName="delete"
                  onClick={() => handleTagDelete(tag.id)}
                  iconColor={colors.red600}
                  iconColorOnHover={colors.red600}
                  a11y_buttonActionMessage={formatMessage(messages.deleteTag)}
                  iconWidth="20px"
                  iconHeight="20px"
                />
              </Box>
            </Box>
            <TagCount
              count={tag.attributes.total_input_count}
              totalCount={inputsTotal}
              filteredCount={tag.attributes.filtered_input_count}
            />
            <Modal
              opened={renameTagModalOpenedId === tag.id}
              close={closeTagRenameModal}
            >
              <RenameTagModal
                closeRenameModal={closeTagRenameModal}
                originalTagName={tag.attributes.name}
                id={tag.id}
                analysisId={analysisId}
              />
            </Modal>
          </TagContainer>
        ))}
      </Box>
      <Modal
        opened={autotaggingModalIsOpened}
        close={() => setAutotaggingModalIsOpened(false)}
      >
        <AutotaggingModal
          onCloseModal={() => setAutotaggingModalIsOpened(false)}
        />
      </Modal>
    </Box>
  );
};

export default Tags;
