import React, { useMemo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAddAnalysisTagging from 'api/analysis_taggings/useAddAnalysisTagging';
import useAnalysisTaggings from 'api/analysis_taggings/useAnalysisTaggings';
import useDeleteAnalysisTagging from 'api/analysis_taggings/useDeleteAnalysisTagging';
import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';

import { useParams } from 'utils/router';

import Tag from '../Tags/Tag';

const Taggings = ({
  inputId,
  onlyShowTagged = true,
}: {
  inputId: string;
  onlyShowTagged?: boolean;
}) => {
  const { analysisId } = useParams({
    from: '/$locale/admin/projects/$projectId/analysis/$analysisId',
  });

  const { data: tags } = useAnalysisTags({
    analysisId,
  });
  const { mutate: addTagging } = useAddAnalysisTagging();
  const { mutate: deleteTagging } = useDeleteAnalysisTagging();

  const { data: taggings } = useAnalysisTaggings(analysisId);

  const taggingsForInput = useMemo(
    () =>
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      taggings?.data?.filter(
        (tagging) => tagging.relationships.input.data.id === inputId
      ),
    [taggings, inputId]
  );

  return (
    <Box display="flex" gap="8px" flexWrap="wrap">
      {/* TODO: Fix this the next time the file is edited. */}
      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
      {tags?.data?.map((tag) => {
        const taggingForTag = taggingsForInput?.find(
          (tagging) => tagging.relationships.tag.data.id === tag.id
        );
        if (onlyShowTagged && !taggingForTag) return null;
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
                  // TODO: Fix this the next time the file is edited.
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
