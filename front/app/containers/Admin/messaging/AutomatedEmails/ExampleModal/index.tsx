import React, { useEffect, useState } from 'react';
import Modal from 'components/UI/Modal';
import useCampaignExamples from 'api/campaign_examples/useCampaignExamples';
import { Button, Box, Text } from '@citizenlab/cl2-component-library';
import useCampaign from 'api/campaigns/useCampaign';
import T from 'components/T';
import EmptyState from './EmptyState';
import ExampleFrame from './ExampleFrame';

const mod = (n: number, m: number) => ((n % m) + m) % m;
const ExampleModal = ({
  campaignId,
  onClose,
}: {
  campaignId: string | null;
  onClose: () => void;
}) => {
  const { data: examples, isLoading } = useCampaignExamples({ campaignId });
  const { data: campaign } = useCampaign(campaignId);
  const [selectedExampleIdx, setSelectedExampleIdx] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (examples?.data?.length) {
      setSelectedExampleIdx(0);
    }
  }, [examples]);

  const changeSelectedExample = (offset: number) => {
    setSelectedExampleIdx((idx) =>
      mod((idx || 0) + offset, examples?.data.length || 1)
    );
  };

  const selectedExample =
    selectedExampleIdx !== null && examples?.data[selectedExampleIdx];

  return (
    <Modal
      opened={!!campaignId}
      close={() => onClose()}
      header={
        <T value={campaign?.data.attributes.campaign_description_multiloc} />
      }
    >
      <Box mx="30px" mt="30px">
        {!isLoading && examples?.data.length === 0 && <EmptyState />}
        {!isLoading &&
          examples?.data.length !== 0 &&
          selectedExampleIdx !== null && (
            <Box>
              {selectedExample && (
                <ExampleFrame example={selectedExample} campaign={campaign} />
              )}
              <Box display="flex" justifyContent="center" alignItems="center">
                <Button
                  m="2px"
                  p="4px"
                  maxWidth="32px"
                  icon="chevron-left"
                  buttonStyle="secondary-outlined"
                  onClick={() => changeSelectedExample(-1)}
                />
                <Box mx="24px" w="30px" display="flex" justifyContent="center">
                  <Text color="blue500" fontSize="m">
                    {selectedExampleIdx + 1}/{examples?.data.length}
                  </Text>
                </Box>
                <Button
                  m="2px"
                  p="4px"
                  maxWidth="32px"
                  icon="chevron-right"
                  buttonStyle="secondary-outlined"
                  onClick={() => changeSelectedExample(1)}
                />
              </Box>
              <Box display="flex" w="100%" justifyContent="center">
                <Text color="grey500">These are emails sent to users</Text>
              </Box>
            </Box>
          )}
      </Box>
    </Modal>
  );
};

export default ExampleModal;
