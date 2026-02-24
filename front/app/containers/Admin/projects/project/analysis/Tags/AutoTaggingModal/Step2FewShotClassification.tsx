import React, { useState } from 'react';

import {
  Box,
  Button,
  CheckboxWithLabel,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import { xor } from 'lodash-es';

import { ITagData } from 'api/analysis_tags/types';
import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';

import { useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from '../messages';
import Tag from '../Tag';

type Props = {
  onLaunch: (tagsIds: string[]) => void;
};

const Step2LabelClassification = ({ onLaunch }: Props) => {
  const { formatMessage } = useIntl();
  const { analysisId } = useParams({
    from: '/$locale/admin/projects/$projectId/analysis/$analysisId',
  });
  const { data: tags } = useAnalysisTags({ analysisId });

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const customTags = tags?.data.filter(
    (t) => t.attributes.tag_type === 'custom'
  );

  const handleTagSelect = (tagId: string) => {
    setSelectedTagIds((tagIds) => xor(tagIds, [tagId]));
  };

  const listFull = selectedTagIds.length >= 10;

  const isElegible = (tag: ITagData) => {
    return tag.attributes.total_input_count >= 3;
  };

  return (
    <Box>
      <Title>{formatMessage(messages.fewShotTitle)}</Title>
      <Text>{formatMessage(messages.fewShotSubtitle)}</Text>
      <Text>{formatMessage(messages.fewShotSubtitle2)}</Text>
      <Box>
        {customTags?.length === 0 && (
          <Text textAlign="center" fontWeight="bold">
            {formatMessage(messages.fewShotsEmpty)}
          </Text>
        )}
        {customTags?.map((tag) => (
          <Box key={tag.id} display="flex" justifyContent="flex-start" mb="8px">
            <CheckboxWithLabel
              disabled={
                (listFull && !selectedTagIds.includes(tag.id)) ||
                !isElegible(tag)
              }
              checked={selectedTagIds.includes(tag.id)}
              onChange={() => handleTagSelect(tag.id)}
              labelTooltipText={
                !isElegible(tag) ? 'You need at least 3 assigned inputs' : ''
              }
              label={
                <Box display="flex" opacity={isElegible(tag) ? 1 : 0.6}>
                  <Tag
                    name={`${tag.attributes.name} (${tag.attributes.total_input_count})`}
                    tagType={tag.attributes.tag_type}
                  />
                </Box>
              }
            />
          </Box>
        ))}
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
