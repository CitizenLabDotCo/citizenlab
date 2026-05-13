import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { AutoTaggingMethod } from 'api/analysis_background_tasks/types';
import useLaunchAnalysisAutotagging from 'api/analysis_background_tasks/useLaunchAnalysisAutotagging';

import GoBackButton from 'components/UI/GoBackButton';

import { trackEventByName } from 'utils/analytics';
import { useParams } from 'utils/router';

import useAnalysisFilterParams from '../../hooks/useAnalysisFilterParams';
import tracks from '../../tracks';

import Step1 from './Step1';
import Step2FewShotClassification from './Step2FewShotClassification';
import Step2LabelClassification from './Step2LabelClassification';

const AutotaggingModal = ({ onCloseModal }: { onCloseModal: () => void }) => {
  const [step, setStep] = useState<
    'step1' | 'step2LabelClassification' | 'step2FewShotClassification'
  >('step1');
  const [autoTaggingTarget, setAutoTaggingTarget] = useState<'all' | 'filters'>(
    'all'
  );

  const { analysisId } = useParams({
    from: '/$locale/admin/projects/$projectId/analysis/$analysisId',
  });
  const {
    mutate: launchTagging,
    isLoading,
    variables,
  } = useLaunchAnalysisAutotagging();
  const currentFilters = useAnalysisFilterParams();

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

    const filters =
      autoTaggingTarget === 'filters' ? currentFilters : undefined;
    launchTagging(
      { analysisId, autoTaggingMethod, tagsIds, filters },
      {
        onSuccess: () => {
          trackEventByName(tracks.autoTaggingPerformed, {
            analysisId,
            autoTaggingMethod,
          });
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
          filters={currentFilters}
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
