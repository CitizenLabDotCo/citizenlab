import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import useLaunchAnalysisAutotagging from 'api/analysis_background_tasks/useLaunchAnalysisAutotagging';
import { AutoTaggingMethod } from 'api/analysis_background_tasks/types';

import { Box } from '@citizenlab/cl2-component-library';
import GoBackButton from 'components/UI/GoBackButton';
import Step1 from './Step1';
import Step2LabelClassification from './Step2LabelClassification';
import Step2FewShotClassification from './Step2FewShotClassification';
import useAnalysisFilterParams from '../../hooks/useAnalysisFilterParams';

const AutotaggingModal = ({ onCloseModal }: { onCloseModal: () => void }) => {
  const [step, setStep] = useState<
    'step1' | 'step2LabelClassification' | 'step2FewShotClassification'
  >('step1');
  const [autoTaggingTarget, setAutoTaggingTarget] = useState<'all' | 'filters'>(
    'all'
  );

  const { analysisId } = useParams() as { analysisId: string };
  const {
    mutate: launchTagging,
    isLoading,
    variables,
  } = useLaunchAnalysisAutotagging();
  const filters = useAnalysisFilterParams();

  const handleOnSelectMethod = (
    autoTaggingMethod: AutoTaggingMethod,
    tagsIds?: string[]
  ) => {
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
      { analysisId, autoTaggingMethod, tagsIds },
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
          autoTaggingTarget={autoTaggingTarget}
          onChangeAutoTaggingTarget={(target) => setAutoTaggingTarget(target)}
          filters={filters}
        />
      )}
      {step === 'step2LabelClassification' && (
        <>
          <GoBackButton onClick={() => setStep('step1')} />
          <Step2LabelClassification
            onLaunch={(tagsIds) =>
              handleOnSelectMethod('label_classification', tagsIds)
            }
          />
        </>
      )}
      {step === 'step2FewShotClassification' && (
        <>
          <GoBackButton onClick={() => setStep('step1')} />
          <Step2FewShotClassification
            onLaunch={(tagsIds) =>
              handleOnSelectMethod('few_shot_classification', tagsIds)
            }
          />
        </>
      )}
    </Box>
  );
};

export default AutotaggingModal;
