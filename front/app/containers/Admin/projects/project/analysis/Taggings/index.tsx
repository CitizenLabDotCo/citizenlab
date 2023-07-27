import React from 'react';

import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';
import useAnalysisTaggings from 'api/analysis_taggings/useAnalysisTaggings';
import useAddAnalysisTagging from 'api/analysis_taggings/useAddAnalysisTagging';
import useDeleteAnalysisTagging from 'api/analysis_taggings/useDeleteAnalysisTagging';

import { useParams } from 'react-router-dom';
import Tag from '../Tags/Tag';
import { Box } from '@citizenlab/cl2-component-library';

const Taggings = ({ inputId }: { inputId: string }) => {
  const { analysisId } = useParams() as { analysisId: string };

  const { data: tags } = useAnalysisTags({
    analysisId,
  });
  const { mutate: addTagging } = useAddAnalysisTagging();
  const { mutate: deleteTagging } = useDeleteAnalysisTagging();

  const { data: taggings } = useAnalysisTaggings(analysisId);

  const taggingsForInput = taggings?.data?.filter(
    (tagging) => tagging.relationships.input.data.id === inputId
  );

  return (
    <Box display="flex" gap="12px">
      {tags?.data?.map((tag) => {
        const taggingForTag = taggingsForInput?.find(
          (tagging) => tagging.relationships.tag.data.id === tag.id
        );
        return (
          <Tag
            key={tag.id}
            name={tag.attributes.name}
            tagType={tag.attributes.tag_type}
            tagginsConfig={{
              isSelectedAsTagging: !!taggingForTag,
              onAddTagging: () => {
                addTagging({ analysisId, tagId: tag.id, inputId });
              },
              onDeleteTagging: () => {
                taggingForTag &&
                  deleteTagging({ analysisId, id: taggingForTag?.id });
              },
            }}
          />
        );
      })}
    </Box>
  );
};

export default Taggings;
