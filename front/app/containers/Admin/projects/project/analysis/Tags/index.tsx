import React, { useState } from 'react';

import {
  Box,
  Input,
  Button,
  IconButton,
  colors,
} from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';

import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';
import useAddAnalysisTag from 'api/analysis_tags/useAddAnalysisTag';
import useDeleteAnalysisTag from 'api/analysis_tags/useDeleteAnalysisTag';

import { useParams } from 'react-router-dom';

import messages from '../messages';
import { useIntl } from 'utils/cl-intl';
import Modal from 'components/UI/Modal';
import RenameTagModal from './RenameTagModal';
import Tag from './Tag';

const Tags = () => {
  const [name, setName] = useState('');
  const [renameTagModalOpenedId, setRenameTagModalOpenedId] = useState('');

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

  return (
    <div>
      <Box>
        <Box
          display="flex"
          alignItems="center"
          mb="8px"
          as="form"
          className="intercom-insights-edit-add-tag-form"
        >
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
        {tags?.data.map((tag) => (
          <Box
            key={tag.id}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb="8px"
            p="8px"
          >
            <Tag
              name={tag.attributes.name}
              tag_type={tag.attributes.tag_type}
            />
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
          </Box>
        ))}
      </Box>
    </div>
  );
};

export default Tags;
