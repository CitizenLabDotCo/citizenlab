import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import useLaunchAnalysisAutotagging from 'api/analysis_background_tasks/useLaunchAnalysisAutotagging';

import { Box } from '@citizenlab/cl2-component-library';
import Step1 from './Step1';
import { AutoTaggingMethod } from 'api/analysis_background_tasks/types';
import Step2LabelClassification from './Step2LabelClassification';
import GoBackButton from 'components/UI/GoBackButton';

const AutotaggingModal = ({ onCloseModal }: { onCloseModal: () => void }) => {
  const [step, setStep] = useState<'step1' | 'step2LabelClassification'>(
    'step1'
  );
  const { analysisId } = useParams() as { analysisId: string };
  const {
    mutate: launchTagging,
    isLoading,
    variables,
  } = useLaunchAnalysisAutotagging();

  const handleOnSelectMethod = (autoTaggingMethod: AutoTaggingMethod) => {
    if (isLoading) return;

    if (step === 'step1' && autoTaggingMethod === 'label_classification') {
      setStep('step2LabelClassification');
      return;
    }

    launchTagging(
      { analysisId, autoTaggingMethod },
      {
        onSuccess: () => {
          onCloseModal();
        },
      }
    );
  };

  return (
    <Box px="24px">
      {step === 'step1' && (
        <Step1
          onSelectMethod={handleOnSelectMethod}
          isLoading={isLoading}
          loadingMethod={variables?.autoTaggingMethod}
        />
      )}
      {step === 'step2LabelClassification' && (
        <>
          <GoBackButton onClick={() => setStep('step1')} />
          <Step2LabelClassification />
        </>
      )}
    </Box>
  );
};

export default AutotaggingModal;
