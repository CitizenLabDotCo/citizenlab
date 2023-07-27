import React, { useState } from 'react';

import {
  Box,
  Input,
  Button,
  IconButton,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';

import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';
import useAddAnalysisTag from 'api/analysis_tags/useAddAnalysisTag';
import useDeleteAnalysisTag from 'api/analysis_tags/useDeleteAnalysisTag';

import { useParams, useSearchParams } from 'react-router-dom';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import messages from '../messages';
import { useIntl } from 'utils/cl-intl';
import Modal from 'components/UI/Modal';
import RenameTagModal from './RenameTagModal';
import Tag from './Tag';
import styled from 'styled-components';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

const TagContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 8px;
  border: 1px solid transparent;
  border-radius: ${stylingConsts.borderRadius};
  &:hover {
    border: 1px solid ${colors.borderLight};
  }
  &.selected {
    border: 1px solid ${colors.borderLight};
  }
`;

const Tags = () => {
  const [name, setName] = useState('');
  const [renameTagModalOpenedId, setRenameTagModalOpenedId] = useState('');
  const [search] = useSearchParams();

  const { formatMessage } = useIntl();

  const { analysisId } = useParams() as { analysisId: string };

  const { data: tags } = useAnalysisTags({
    analysisId,
  });
  const { mutate: addTag, isLoading, error } = useAddAnalysisTag();
  const { mutate: deleteTag } = useDeleteAnalysisTag();

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

  const selectTag = (id: string) => {
    updateSearchParams({ tag_ids: [id] });
  };

  const selectedTags = search.get('tag_ids')
    ? JSON.parse(search.get('tag_ids') as string)
    : undefined;

  return (
    <Box>
      <Box>
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
          {formatMessage(messages.allTags)}
        </TagContainer>
        <TagContainer
          tabIndex={0}
          onClick={() => updateSearchParams({ tag_ids: [] })}
          className={selectedTags?.length === 0 ? 'selected' : ''}
        >
          {formatMessage(messages.noTags)}
        </TagContainer>
        {tags?.data.map((tag) => (
          <TagContainer
            key={tag.id}
            tabIndex={0}
            onClick={() => selectTag(tag.id)}
            className={selectedTags?.includes(tag.id) ? 'selected' : ''}
          >
            <Tag name={tag.attributes.name} tagType={tag.attributes.tag_type} />
            <Box display="flex" gap="0px">
              <IconButton
                iconName="edit"
                onClick={() => setRenameTagModalOpenedId(tag.id)}
                iconColor={colors.grey700}
                iconColorOnHover={colors.grey700}
                a11y_buttonActionMessage={formatMessage(messages.editTag)}
              />
              <IconButton
                iconName="delete"
                onClick={() => handleTagDelete(tag.id)}
                iconColor={colors.red600}
                iconColorOnHover={colors.red600}
                a11y_buttonActionMessage={formatMessage(messages.deleteTag)}
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
    </Box>
  );
};

export default Tags;
