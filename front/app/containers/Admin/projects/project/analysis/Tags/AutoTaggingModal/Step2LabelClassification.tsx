import React, { useState } from 'react';
import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import { xor } from 'lodash-es';
import Tag from '../Tag';
import AddTag from '../AddTag';

type Props = {
  onLaunch: (tagsIds: string[]) => void;
};
const Step2LabelClassification = ({ onLaunch }: Props) => {
  const { analysisId } = useParams() as { analysisId: string };
  const { data: tags } = useAnalysisTags({ analysisId });

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const customTags = tags?.data.filter(
    (t) => t.attributes.tag_type === 'custom'
  );

  const handleTagSelect = (tagId: string) => {
    setSelectedTagIds((tagIds) => xor(tagIds, [tagId]));
  };

  const listFull = selectedTagIds.length >= 10;

  return (
    <Box>
      <Title>Classification by label</Title>
      <Text>
        Select maximum 10 tags you would like the inputs to be distributed
        between. Inputs already associated with these tags will not be
        classified again.
      </Text>
      <Text>
        The classification is solely based on the name of the tag. Pick relevant
        keywords for the best results.
      </Text>
      <Box>
        {customTags?.map((tag) => (
          <Box key={tag.id} display="flex" justifyContent="flex-start" mb="8px">
            <Checkbox
              disabled={listFull && !selectedTagIds.includes(tag.id)}
              checked={selectedTagIds.includes(tag.id)}
              onChange={() => handleTagSelect(tag.id)}
              label={
                <>
                  <Tag
                    name={tag.attributes.name}
                    tagType={tag.attributes.tag_type}
                  />
                </>
              }
            />
          </Box>
        ))}
      </Box>
      <Box ml="34px">
        <AddTag />
      </Box>
      <Box mt="32px">
        <Button
          disabled={selectedTagIds.length === 0}
          onClick={() => onLaunch(selectedTagIds)}
        >
          Launch
        </Button>
      </Box>
    </Box>
  );
};

export default Step2LabelClassification;
