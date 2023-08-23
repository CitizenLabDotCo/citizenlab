import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import useLaunchAnalysisAutotagging from 'api/analysis_background_tasks/useLaunchAnalysisAutotagging';
import { AutoTaggingMethod } from 'api/analysis_background_tasks/types';

import { Box } from '@citizenlab/cl2-component-library';
import GoBackButton from 'components/UI/GoBackButton';
import Step1 from './Step1';
import Step2LabelClassification from './Step2LabelClassification';
import Step2FewShotClassification from './Step2FewShotClassification';

const AutotaggingModal = ({ onCloseModal }: { onCloseModal: () => void }) => {
  const [step, setStep] = useState<
    'step1' | 'step2LabelClassification' | 'step2FewShotClassification'
  >('step1');
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
    if (step === 'step1' && autoTaggingMethod === 'few_shot_classification') {
      setStep('step2FewShotClassification');
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
      {step === 'step2FewShotClassification' && (
        <>
          <GoBackButton onClick={() => setStep('step1')} />
          <Step2FewShotClassification />
        </>
      )}
    </Box>
  );
};

export default AutotaggingModal;
