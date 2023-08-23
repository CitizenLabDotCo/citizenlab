import {
  Box,
  Input,
  Button,
  Checkbox,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import useAddAnalysisTag from 'api/analysis_tags/useAddAnalysisTag';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';
import Error from 'components/UI/Error';
import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';
import Tag from './Tag';
import useAddAnalysisBulkTagging from 'api/analysis_taggings/useAnalysisBulkTaggings';
import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';
import { Divider } from 'semantic-ui-react';

const BulkCreateTaggingsModal = ({
  onCloseModal,
}: {
  onCloseModal: () => void;
}) => {
  const [name, setName] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>();
  const filters = useAnalysisFilterParams();

  const { analysisId } = useParams() as { analysisId: string };
  const { mutate: addTag, isLoading, error } = useAddAnalysisTag();
  const { mutate: bulkAddTaggings, isLoading: isBulkLoading } =
    useAddAnalysisBulkTagging();
  const { data: tags } = useAnalysisTags({ analysisId });

  const { formatMessage } = useIntl();

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

  const createAnalysisBulkTaggings = () => {
    if (selectedTag) {
      bulkAddTaggings(
        {
          analysisId,
          tagId: selectedTag,
          filters,
        },
        {
          onSuccess: () => {
            onCloseModal();
          },
        }
      );
    }
  };

  const filteredInputsTotal = tags?.meta.filtered_inputs_total || 1;

  return (
    <Box>
      <Title>Bulk tag {filteredInputsTotal} inputs</Title>
      <Text> Select a tag to add your input to: </Text>
      <Box display="flex" flexWrap="wrap" gap="8px">
        {tags?.data.map((tag) => (
          <Box display="flex" key={tag.id}>
            <Checkbox
              checked={selectedTag === tag.id}
              onChange={() => setSelectedTag(tag.id)}
            />

            <Tag tagType={tag.attributes.tag_type} name={tag.attributes.name} />
          </Box>
        ))}
      </Box>
      <Divider />
      <Text>Don`t see the tag you are looking for? Create a new one here:</Text>
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
        <Box>
          {error && (
            <Error apiErrors={error.errors['name']} fieldName="tag_name" />
          )}
        </Box>
      </Box>
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        mt="20px"
        gap="16px"
      >
        <Button
          onClick={() => {
            onCloseModal();
          }}
          buttonStyle="secondary"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            createAnalysisBulkTaggings();
          }}
          disabled={!selectedTag}
          processing={isBulkLoading}
        >
          Add to tag
        </Button>
      </Box>
    </Box>
  );
};

export default BulkCreateTaggingsModal;
