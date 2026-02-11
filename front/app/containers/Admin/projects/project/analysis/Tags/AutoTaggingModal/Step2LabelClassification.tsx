import React, { useState } from 'react';

import {
  Box,
  Button,
  CheckboxWithLabel,
  Divider,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import { xor } from 'lodash-es';

import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';

import { useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import AddTag from '../AddTag';
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

  return (
    <Box>
      <Title>{formatMessage(messages.byLabelTitle)}</Title>
      <Text>{formatMessage(messages.byLabelSubtitle)}</Text>
      <Text>{formatMessage(messages.byLabelSubtitle2)}</Text>
      <Box>
        {customTags && customTags.length > 0 && (
          <>
            <Divider />
            <CheckboxWithLabel
              indeterminate={
                selectedTagIds.length > 0 &&
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                selectedTagIds.length !== customTags?.length
              }
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              checked={selectedTagIds.length === customTags?.length}
              onChange={() =>
                setSelectedTagIds(
                  // TODO: Fix this the next time the file is edited.
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  selectedTagIds.length === customTags?.length
                    ? [] // TODO: Fix this the next time the file is edited.
                    : // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                      customTags?.map((t) => t.id) || []
                )
              }
              label={formatMessage(messages.selectAll)}
            />
            <Divider />
          </>
        )}
        {customTags?.map((tag) => (
          <Box key={tag.id} display="flex" justifyContent="flex-start" mb="8px">
            <CheckboxWithLabel
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
      <Divider />
      <Box>
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
