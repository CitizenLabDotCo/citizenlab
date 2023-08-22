import React, { useState } from 'react';
import styled from 'styled-components';
import { omit } from 'lodash-es';

import { useParams } from 'react-router-dom';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';
import useAddAnalysisTag from 'api/analysis_tags/useAddAnalysisTag';
import useDeleteAnalysisTag from 'api/analysis_tags/useDeleteAnalysisTag';
import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';

import {
  Box,
  Input,
  Button,
  IconButton,
  colors,
  stylingConsts,
  Text,
  Icon,
  ListItem,
  Checkbox,
} from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
import Modal from 'components/UI/Modal';
import RenameTagModal from './RenameTagModal';
import Tag from './Tag';
import AutotaggingModal from './AutotaggingModal';
import TagCount from './TagCount';

import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

import { useQueryClient } from '@tanstack/react-query';
import inputsKeys from 'api/analysis_inputs/keys';

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
  position: relative;
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
  const [name, setName] = useState('');
  const [renameTagModalOpenedId, setRenameTagModalOpenedId] = useState('');
  const [autotaggingModalIsOpened, setAutotaggingModalIsOpened] =
    useState(false);

  const filters = useAnalysisFilterParams();

  const { formatMessage } = useIntl();

  const { analysisId } = useParams() as { analysisId: string };

  const queryClient = useQueryClient();
  const { data: tags } = useAnalysisTags({
    analysisId,
    filters: omit(filters, 'tag_ids'),
  });
  const { mutate: addTag, isLoading, error } = useAddAnalysisTag();
  const { mutate: deleteTag } = useDeleteAnalysisTag();

  const inputsTotal = tags?.meta.inputs_total || 1;
  const filteredInputsTotal = tags?.meta.filtered_inputs_total || 1;
  const inputsWithoutTags = tags?.meta.inputs_without_tags || 1;
  const filteredInputsWithoutTags =
    tags?.meta.filtered_inputs_without_tags || 1;

  const onChangeName = (name: string) => {
    setName(name);
  };

  const handleTagSubmit = () => {
    addTag(
      {
        analysisId,
        name,
      },
      {
        onSuccess: () => {
          setName('');
        },
      }
    );
  };

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

  const selectedTags = filters.tag_ids;

  const toggleТаgClick = (id: string) => {
    console.log('toggleТаgClick');
    const nonNullSelectedTags = selectedTags?.filter((tagId) => tagId !== null);
    if (!selectedTags?.includes(id)) {
      updateSearchParams({ tag_ids: [...(nonNullSelectedTags || []), id] });
    } else {
      updateSearchParams({
        tag_ids: nonNullSelectedTags?.filter((tagId) => tagId !== id),
      });
    }
    queryClient.invalidateQueries(inputsKeys.lists());
  };

  const tagsAreSelected =
    selectedTags && selectedTags?.length > 0 && selectedTags[0] !== null;

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
        <Box display="flex" alignItems="center" mb="8px" as="form">
          <Input
            type="text"
            value={name}
            onChange={onChangeName}
            placeholder={formatMessage(messages.addTag)}
            size="small"
          />
          <Button
            ml="4px"
            p="6px"
            onClick={handleTagSubmit}
            disabled={!name || isLoading}
            icon="plus"
          />
        </Box>
        <div>
          {error && (
            <Error apiErrors={error.errors['name']} fieldName="tag_name" />
          )}
        </div>
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
          className={selectedTags && selectedTags[0] === null ? 'selected' : ''}
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
            onClick={(e) => {
              e.stopPropagation();
              toggleТаgClick(tag.id);
            }}
            className={selectedTags?.includes(tag.id) ? 'selected' : ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                toggleТаgClick(tag.id);
              }
            }}
          >
            {tagsAreSelected && (
              <Box position="absolute" top="20px">
                <Checkbox
                  checked={!!selectedTags?.includes(tag.id)}
                  onChange={() => {
                    toggleТаgClick(tag.id);
                  }}
                  size="20px"
                />
              </Box>
            )}
            <Box ml={tagsAreSelected ? '28px' : '0px'}>
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
            </Box>
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
