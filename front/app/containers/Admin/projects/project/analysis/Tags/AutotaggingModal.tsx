import { Box, Title, Button } from '@citizenlab/cl2-component-library';
import { tagTypes } from 'api/analysis_tags/types';
import React from 'react';

import useLaunchAnalysisAutotagging from 'api/analysis_background_tasks/useLaunchAnalysisAutotagging';
import { useParams } from 'react-router-dom';
import { TagTypeColorMap } from './Tag';

const AutotaggingModal = ({ onCloseModal }: { onCloseModal: () => void }) => {
  const { analysisId } = useParams() as { analysisId: string };
  const { mutate: launchTagging, isLoading } = useLaunchAnalysisAutotagging();
  return (
    <Box>
      <Title>Autotagging modal</Title>
      <Box display="flex" flexWrap="wrap" justifyContent="space-between">
        {tagTypes
          .filter((tagTypes) => tagTypes !== 'custom')
          .map((tagType) => {
            return (
              <Box w="50%" key={tagType} p="4px">
                <Button
                  bgColor={TagTypeColorMap[tagType]?.background}
                  textColor={TagTypeColorMap[tagType]?.text}
                  processing={isLoading}
                  onClick={() =>
                    launchTagging(
                      { analysisId, autoTaggingMethod: tagType },
                      {
                        onSuccess: () => {
                          onCloseModal();
                        },
                      }
                    )
                  }
                >
                  {tagType}
                </Button>
              </Box>
            );
          })}
      </Box>
    </Box>
  );
};

export default AutotaggingModal;
