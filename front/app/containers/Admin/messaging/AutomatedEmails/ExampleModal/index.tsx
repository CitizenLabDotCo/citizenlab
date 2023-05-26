import React, { useEffect, useState } from 'react';
import Modal from 'components/UI/Modal';
import useCampaignExamples from 'api/campaign_examples/useCampaignExamples';
import { Button, Box, Title } from '@citizenlab/cl2-component-library';
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
    <Modal opened={!!campaignId} close={() => onClose()}>
      <Title>
        <T value={campaign?.data.attributes.campaign_description_multiloc} />
      </Title>
      {!isLoading && examples?.data.length === 0 && <EmptyState />}
      {!isLoading &&
        examples?.data.length !== 0 &&
        selectedExampleIdx !== null && (
          <Box>
            {selectedExample && <ExampleFrame example={selectedExample} />}
            <Box display="flex" justifyContent="center" alignItems="center">
              <Button
                onClick={() => changeSelectedExample(-1)}
                buttonStyle="text"
              >
                previous
              </Button>
              <Box>
                {selectedExampleIdx + 1}/{examples?.data.length}
              </Box>
              <Button
                onClick={() => changeSelectedExample(1)}
                buttonStyle="text"
              >
                next
              </Button>
            </Box>
          </Box>
        )}
    </Modal>
  );
};

export default ExampleModal;
