import React, { useEffect, useState } from 'react';

import { useFormContext } from 'react-hook-form';

import { IFlatCustomField } from 'api/custom_fields/types';
import { IPhaseData } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import SimilarIdeasList from 'containers/IdeasNewPage/SimilarInputs/SimilarInputsList';

const InputIQ = ({
  phase,
  field,
}: {
  phase: IPhaseData | undefined;
  field: IFlatCustomField;
}) => {
  const { watch } = useFormContext();
  const isInputIQEnabled = useFeatureFlag({
    name: 'input_iq',
  });
  const showSimilarInputs = !!(
    phase?.attributes.similarity_enabled && isInputIQEnabled
  );

  const titleMultiloc = watch('title_multiloc');
  const bodyMultiloc = watch('body_multiloc');

  // Debounced values for similar ideas lookup
  const [debouncedTitleMultiloc, setDebouncedTitleMultiloc] =
    useState(titleMultiloc);
  const [debouncedBodyMultiloc, setDebouncedBodyMultiloc] =
    useState(bodyMultiloc);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTitleMultiloc(titleMultiloc);
      setDebouncedBodyMultiloc(bodyMultiloc);
    }, 500);

    return () => clearTimeout(timer);
  }, [titleMultiloc, bodyMultiloc]);

  if (!showSimilarInputs) {
    return null;
  }

  return (
    <div>
      <SimilarIdeasList
        titleMultiloc={
          field.code === 'title_multiloc' ? debouncedTitleMultiloc : undefined
        }
        bodyMultiloc={
          field.code === 'body_multiloc' ? debouncedBodyMultiloc : undefined
        }
        phase={phase}
      />
    </div>
  );
};

export default InputIQ;
