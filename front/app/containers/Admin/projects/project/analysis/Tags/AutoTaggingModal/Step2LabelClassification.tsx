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

import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

type Props = {
  onLaunch: (tagsIds: string[]) => void;
};
const Step2LabelClassification = ({ onLaunch }: Props) => {
  const { formatMessage } = useIntl();
  const { analysisId } = useParams() as { analysisId: string };
  const { data: tags } = useAnalysisTags({ analysisId });

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const customTags = tags?.data.filter(
    (t) => t.attributes.tag_type === 'custom'
  );

  const handleTagSelect = (tagId: string) => {
    setSelectedTagIds((tagIds) => xor(tagIds, [tagId]));
  };

  return (
    <Box>
      <Title>{formatMessage(messages.byLabelTitle)}</Title>
      <Text>{formatMessage(messages.byLabelSubtitle)}</Text>
      <Text>{formatMessage(messages.byLabelSubtitle2)}</Text>
      <Box>
        {customTags?.map((tag) => (
          <Box key={tag.id} display="flex" justifyContent="flex-start" mb="8px">
            <Checkbox
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
          {formatMessage(messages.launch)}
        </Button>
      </Box>
    </Box>
  );
};

export default Step2LabelClassification;
